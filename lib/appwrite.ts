import { Account, Databases, Client, ID, Avatars, Query, Storage } from "react-native-appwrite"
import { CreateUserParams, GetMenuParams, SignInParams } from "../type"

export const appwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
    platform: "com.almafoods.ordering",
    databaseId: "6a579169000b72d7723a",
    bucketId: "6a59518e0008d030aaf9",
    userCollectionId: "user",
    categoriesCollectionId: "categories",
    menuCollectionId: "menu",
    customizationsCollectionId: "customizations",
    menuCustomizationsCollectionId: "menu_customizations"
}

export const client = new Client()

client
.setEndpoint(appwriteConfig.endpoint)
.setProject(appwriteConfig.projectId)
.setPlatform(appwriteConfig.platform)

export const account = new Account(client)
export const databases = new Databases(client)
export const storage = new Storage(client)
export const avatars = new Avatars(client)

export const createuser = async ({ email, password, name }: CreateUserParams) => {
    try {
        const newAccount = await account.create({
            userId: ID.unique(),
            email,
            password,
            name,
        })
        if (!newAccount) throw new Error("Failed to create account")
        await signIn({ email, password })

        // Bangun URL avatar manual, bukan pakai avatars.getInitials() (yang fetch bytes, bukan URL)
        const avatarUrl = `${appwriteConfig.endpoint}/avatars/initials?name=${encodeURIComponent(name)}&project=${appwriteConfig.projectId}`

        return await databases.createDocument({
            databaseId: appwriteConfig.databaseId,
            collectionId: appwriteConfig.userCollectionId,
            documentId: ID.unique(),
            data: {
                email,
                name,
                accountId: newAccount.$id,
                avatar: avatarUrl,
                phone: "",
                address1: "",
                address2: "",
            },
        })
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : String(error))
    }
}

export const signIn = async ({ email, password }: SignInParams) => {
    try {
        const session = await account.createEmailPasswordSession({ email, password })
        return session
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.log("signIn first attempt failed:", message)

        // Kalau errornya spesifik karena masih ada session aktif,
        // hapus SEMUA session dulu baru coba login ulang sekali.
        if (message.toLowerCase().includes("session is active")) {
            try {
                await account.deleteSessions()
                console.log("deleteSessions success, retrying login...")
            } catch (deleteError) {
                console.log("deleteSessions failed:", deleteError)
            }

            try {
                const retrySession = await account.createEmailPasswordSession({ email, password })
                return retrySession
            } catch (retryError) {
                console.log("signIn retry failed:", retryError)
                throw new Error(
                    retryError instanceof Error ? retryError.message : String(retryError)
                )
            }
        }

        throw new Error(message)
    }
}

export const getCurrentUser = async () => {
    try {
        let currentAccount
        try {
            currentAccount = await account.get()
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            // Kadang session yang baru dibuat butuh sesaat untuk "nempel"
            // di client (race condition), jadi coba sekali lagi setelah delay singkat.
            if (message.toLowerCase().includes("scope") || message.toLowerCase().includes("guests")) {
                await new Promise((resolve) => setTimeout(resolve, 400))
                currentAccount = await account.get()
            } else {
                throw error
            }
        }

        if (!currentAccount) throw new Error("No current account")

        const currentUser = await databases.listDocuments({
            databaseId: appwriteConfig.databaseId,
            collectionId: appwriteConfig.userCollectionId,
            queries: [Query.equal("accountId", currentAccount.$id)],
        })

        if (!currentUser) throw new Error("Failed to get current user")
        return currentUser.documents[0]
    } catch (error) {
        console.log(error)
        throw new Error(error instanceof Error ? error.message : String(error))
    }
}

export const getMenu = async ({ category, query }: GetMenuParams) => {
    try {
        const queries: string[] = []

        if (category) queries.push(Query.equal("categories", category))
        if (query) queries.push(Query.search("name", query))

        const menus = await databases.listDocuments({
            databaseId: appwriteConfig.databaseId,
            collectionId: appwriteConfig.menuCollectionId,
            queries,
        })

        return menus.documents
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : String(error))
    }
}

// BARU: ambil 1 menu item spesifik berdasarkan ID, dipakai di halaman Detail.
// Param dibungkus object ({ id }) supaya polanya konsisten dengan getMenu/getCategories,
// sehingga bisa langsung dipakai lewat useAppwrite({ fn: getMenuById, params: { id } }).
export const getMenuById = async ({ id }: { id: string }) => {
    try {
        const menuItem = await databases.getDocument({
            databaseId: appwriteConfig.databaseId,
            collectionId: appwriteConfig.menuCollectionId,
            documentId: id,
        })

        return menuItem
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : String(error))
    }
}

// BARU: ambil semua customization (topping & side/"bagian") yang tersedia.
// Dipakai sebagai fallback di halaman Detail kalau menu item tidak punya
// relasi "customizations" sendiri.
export const getCustomizations = async () => {
    try {
        const customizations = await databases.listDocuments({
            databaseId: appwriteConfig.databaseId,
            collectionId: appwriteConfig.customizationsCollectionId,
        })

        return customizations.documents
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : String(error))
    }
}

export const signOut = async () => {
    try {
        await account.deleteSessions()
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : String(error))
    }
}

// Catatan: collection "user" saat ini hanya punya field name, email, accountId, avatar.
// Kalau mau field phone/address ikut tersimpan di Appwrite, tambahkan attribute-nya dulu
// di console Appwrite (collection: user), lalu masukkan ke object "data" di bawah ini.
// Upload foto profil baru ke Storage lalu update field "avatar" di dokumen user.
// "file" harus berbentuk { name, type, size, uri } sesuai hasil dari expo-image-picker.
export const uploadAvatarImage = async ({
    file,
    documentId,
}: {
    file: { name: string; type: string; size: number; uri: string }
    documentId: string
}) => {
    try {
        const uploadedFile = await storage.createFile({
            bucketId: appwriteConfig.bucketId,
            fileId: ID.unique(),
            file,
        })

        // Bangun URL manual (pola sama seperti avatar initials di createuser),
        // supaya konsisten dan tidak tergantung versi SDK.
        const avatarUrl = `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.bucketId}/files/${uploadedFile.$id}/view?project=${appwriteConfig.projectId}`

        const updatedUser = await databases.updateDocument({
            databaseId: appwriteConfig.databaseId,
            collectionId: appwriteConfig.userCollectionId,
            documentId,
            data: { avatar: avatarUrl },
        })

        return updatedUser
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : String(error))
    }
}

export const updateUser = async ({
    documentId,
    name,
    phone,
    address1,
    address2,
}: {
    documentId: string
    name: string
    phone?: string
    address1?: string
    address2?: string
}) => {
    try {
        // Update nama di Appwrite Account (untuk sesi/auth)
        await account.updateName({ name })

        // Update dokumen user di database
        // Pastikan attribute phone, address1, address2 sudah dibuat
        // di collection "user" lewat Appwrite Console sebelum pakai ini.
        const updatedUser = await databases.updateDocument({
            databaseId: appwriteConfig.databaseId,
            collectionId: appwriteConfig.userCollectionId,
            documentId,
            data: { name, phone, address1, address2 },
        })

        return updatedUser
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : String(error))
    }
}

export const getCategories = async () => {
    try {
        const categories = await databases.listDocuments({
            databaseId: appwriteConfig.databaseId,
            collectionId: appwriteConfig.categoriesCollectionId,
        })
        return categories.documents
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : String(error))
    }
}