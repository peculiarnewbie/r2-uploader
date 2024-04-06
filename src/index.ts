import { watch } from "fs/promises";
const path = process.env.DIR_PATH;
if (!path) throw new Error("DIR_PATH is not set");
const watcher = watch(path, {
	recursive: true,
});

const upload = async (file: Buffer, key: string) => {
	await fetch(process.env.WORKER_URL + "/" + key, {
		method: "PUT",
		body: file,
	});
};
console.log("watching", process.env.DIR_PATH);

for await (const event of watcher) {
	if (event.eventType === "rename" && event.filename) {
		const file = Bun.file(path + "/" + event.filename);

		const arrbuf = await file.arrayBuffer();
		const buffer = Buffer.from(arrbuf);

		console.log("uploading", event.filename);

		await upload(buffer, "/from-r2-uploader_" + event.filename);

		console.log("uploaded");
	}
}
