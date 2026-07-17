import { ID, Query } from "react-native-appwrite";
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { appwriteConfig, databases, storage } from "./appwrite";
import dummyData from "./data";

interface Category {
    name: string;
    description: string;
}

interface Customization {
    name: string;
    price: number;
    type: "topping" | "bagian" | "ukuran" | "kulit" | "roti" | "pedas" | "rasa" | "sauce";
}

interface MenuItem {
    name: string;
    description: string;
    image_url: string;
    price: number;
    rating: number;
    calories: number;
    protein: number;
    category_name: string;
    customizations: string[];
}

interface DummyData {
    categories: Category[];
    customizations: Customization[];
    menu: MenuItem[];
}

const data = dummyData as DummyData;

async function clearAll(collectionId: string): Promise<void> {
    let hasMore = true;

    while (hasMore) {
        const list = await databases.listDocuments({
            databaseId: appwriteConfig.databaseId,
            collectionId,
            queries: [Query.limit(100)],
        });

        if (list.documents.length === 0) {
            hasMore = false;
            break;
        }

        await Promise.all(
            list.documents.map((doc) =>
                databases.deleteDocument({
                    databaseId: appwriteConfig.databaseId,
                    collectionId,
                    documentId: doc.$id,
                })
            )
        );

        if (list.documents.length < 100) {
            hasMore = false;
        }
    }
}

async function clearStorage(): Promise<void> {
    let hasMore = true;

    while (hasMore) {
        const list = await storage.listFiles({
            bucketId: appwriteConfig.bucketId,
            queries: [Query.limit(100)],
        });

        if (list.files.length === 0) {
            hasMore = false;
            break;
        }

        await Promise.all(
            list.files.map((file) =>
                storage.deleteFile({ bucketId: appwriteConfig.bucketId, fileId: file.$id })
            )
        );

        if (list.files.length < 100) {
            hasMore = false;
        }
    }
}

// Upload manual lewat XMLHttpRequest, bypass fetch() bawaan Expo yang bermasalah
function uploadFileViaXHR(
    fileUri: string,
    fileName: string,
    mimeType: string
): Promise<{ $id: string }> {
    return new Promise((resolve, reject) => {
        const fileId = ID.unique();

        const formData = new FormData();
        formData.append('fileId', fileId);
        formData.append('file', {
            uri: fileUri,
            name: fileName,
            type: mimeType,
        } as any);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.bucketId}/files`);
        xhr.setRequestHeader('X-Appwrite-Project', appwriteConfig.projectId);
        xhr.setRequestHeader('X-Appwrite-Response-Format', '1.9.5');
        xhr.setRequestHeader('Origin', `appwrite-${Platform.OS}://${appwriteConfig.platform}`);

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(JSON.parse(xhr.responseText));
            } else {
                reject(new Error(`Upload gagal (${xhr.status}): ${xhr.responseText}`));
            }
        };
        xhr.onerror = () => reject(new Error('Network request failed saat upload file'));

        xhr.send(formData as any);
    });
}

async function uploadImageToStorage(imageUrl: string) {
    const filename = imageUrl.split("/").pop()?.split("?")[0] || `file-${Date.now()}.jpg`;
    const localUri = FileSystem.cacheDirectory + filename;

    const downloadResult = await FileSystem.downloadAsync(imageUrl, localUri);

    const extension = filename.split(".").pop()?.toLowerCase();
    const mimeType =
        extension === "jpg" || extension === "jpeg"
            ? "image/jpeg"
            : extension === "webp"
            ? "image/webp"
            : "image/png";

    const result = await uploadFileViaXHR(downloadResult.uri, filename, mimeType);

    await FileSystem.deleteAsync(downloadResult.uri, { idempotent: true });

    // Bangun URL manual, pasti valid dan lengkap
    const fileUrl = `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.bucketId}/files/${result.$id}/view?project=${appwriteConfig.projectId}`;

    return fileUrl;
}

async function seed(): Promise<void> {
    // 1. Clear all
    await clearAll(appwriteConfig.categoriesCollectionId);
    await clearAll(appwriteConfig.customizationsCollectionId);
    await clearAll(appwriteConfig.menuCollectionId);
    await clearAll(appwriteConfig.menuCustomizationsCollectionId);
    await clearStorage();

    // 2. Create Categories
    const categoryMap: Record<string, string> = {};
    for (const cat of data.categories) {
        const doc = await databases.createDocument({
            databaseId: appwriteConfig.databaseId,
            collectionId: appwriteConfig.categoriesCollectionId,
            documentId: ID.unique(),
            data: cat,
        });
        categoryMap[cat.name] = doc.$id;
    }

    // 3. Create Customizations
    const customizationMap: Record<string, string> = {};
    for (const cus of data.customizations) {
        const doc = await databases.createDocument({
            databaseId: appwriteConfig.databaseId,
            collectionId: appwriteConfig.customizationsCollectionId,
            documentId: ID.unique(),
            data: {
                name: cus.name,
                price: cus.price,
                type: cus.type,
            },
        });
        customizationMap[cus.name] = doc.$id;
    }

    // 4. Create Menu Items
    const menuMap: Record<string, string> = {};
    for (const item of data.menu) {
        const uploadedImage = await uploadImageToStorage(item.image_url);

        const doc = await databases.createDocument({
            databaseId: appwriteConfig.databaseId,
            collectionId: appwriteConfig.menuCollectionId,
            documentId: ID.unique(),
            data: {
                name: item.name,
                description: item.description,
                image_url: uploadedImage,
                price: item.price,
                rating: item.rating,
                calories: item.calories,
                protein: item.protein,
                categories: categoryMap[item.category_name],
            },
        });

        menuMap[item.name] = doc.$id;

        // 5. Create menu_customizations
        for (const cusName of item.customizations) {
            await databases.createDocument({
                databaseId: appwriteConfig.databaseId,
                collectionId: appwriteConfig.menuCustomizationsCollectionId,
                documentId: ID.unique(),
                data: {
                    menu: doc.$id,
                    customizations: customizationMap[cusName],
                },
            });
        }
    }

    console.log("✅ Seeding complete.");
}

export default seed;