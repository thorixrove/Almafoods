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
            data: { email, name, accountId: newAccount.$id, avatar: avatarUrl },
        })
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : String(error))
    }
}

export const signIn = async ({ email, password }: SignInParams) => {
    try {
        // Hapus session aktif dulu kalau ada, biar tidak bentrok
        try {
            await account.deleteSession({ sessionId: 'current' })
        } catch (e) {
            // Abaikan error kalau memang tidak ada session aktif
        }

        const session = await account.createEmailPasswordSession({ email, password })
        return session
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : String(error))
    }
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get()
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