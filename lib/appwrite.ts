import { Account, Databases, Client, ID, Avatars, Query, Storage} from "react-native-appwrite"
import { CreateUserParams, GetMenuParams, SignInParams } from "../type"



export const appwriteconfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
    platform: "com.almafoods.ordering",
    databaseId: "6a579169000b72d7723a",
    userCollectionId: "user",


}

export const client = new Client()

client
.setEndpoint(appwriteconfig.endpoint)
.setProject(appwriteconfig.projectId)
.setPlatform(appwriteconfig.platform)

export const account = new Account(client)
export const databases = new Databases(client)
export const storage = new Storage(client)
export const avatars = new Avatars(client)


export const createuser = async ({ email, password, name}: CreateUserParams) => {
    try {
        const newAccount = await account.create(ID.unique(), email, password, name)
        if(!newAccount) throw new Error('Account creation failed')
        await signIn({email, password})

        const avatarUrl = avatars.getInitialsURL(name)

        return await databases.createDocument(
            appwriteconfig.databaseId,
            appwriteconfig.userCollectionId,
            ID.unique(),
            { email, name, accountId: newAccount.$id, avatar: avatarUrl}
        )

    } catch (error) {
        throw new Error(error instanceof Error ? error.message : String(error))
    }
}

export const signIn = async ({ email, password }: SignInParams) => {
    try {
        const session = await account.createEmailPasswordSession(email, password)
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : String(error))
    }
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get()
        if(!currentAccount) throw new Error('Could not retrieve current account')

        const currentUser = await databases.listDocuments(
            appwriteconfig.databaseId,
            appwriteconfig.userCollectionId,
            [Query.equal("accountId", currentAccount.$id)]
        )

        if(!currentUser) throw new Error('Could not retrieve current user')
        return currentUser.documents[0]
    } catch (error) {
        console.log(error)
        throw new Error(error instanceof Error ? error.message : String(error))
    }
}



