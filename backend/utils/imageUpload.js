import "dotenv/config";
import {createClient} from "@supabase/supabase-js";
import ws from "ws";

const KEY = process.env.SUPABASE_ANON_KEY;
const URL = process.env.SUPABASE_URL;
const supabase = createClient(URL, KEY, {
    auth: {
        persistSession: false
    },
    realtime: {
        transport: ws
    }
});

export default async function uploadImage(file) {
    try {
        const fileName = `${Date.now()}-${file.originalname}`;
        const { data, error } = await supabase.storage
            .from("images")
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
            .from("images")
            .getPublicUrl(fileName);

        return publicUrlData.publicUrl;
    } catch (err) {
        throw new Error("Image upload failed: " + err.message);
    }
}

