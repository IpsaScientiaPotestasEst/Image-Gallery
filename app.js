const express = require("express");
const cors = require("cors");
const dns = require("dns");

const app = express();
const port = 8000;

app.use(express.json());
app.use(cors());


async function verifyIsImageUrl(url) {
    try {
       
        const safeUrl = url.startsWith("http") ? url : `https://${url}`;
        
        
        const response = await fetch(safeUrl, { method: "HEAD", timeout: 5000 });
        const contentType = response.headers.get("content-type");

      
        return contentType && contentType.toLowerCase().startsWith("image/");
    } catch (e) {
        console.log(`MIME Verification failed for URL: ${e.message}`);
        return false;
    }
}

app.post("/app", async (req, res) => {
    console.log("Got: ", req.body, " from frontend");

    let username = req.body.username;

  
    if (!username || typeof username !== "string" || username.trim() === "") {
        return res.json({ message: "An error occurred" });
    }

  
    const isValidImage = await verifyIsImageUrl(username);
    if (!isValidImage) {
        return res.json({ message: "Either URL is not an image or image is still loading" });
    }

   
    let hostname;
    try {
        const safeUrl = username.startsWith("http") ? username : `https://${username}`;
        const parsedUrl = new URL(safeUrl);
        hostname = parsedUrl.hostname;
    } catch (e) {
        return res.json({ message: "An error occurred" });
    }

    dns.lookup(hostname, (err) => {
        if (err) {
            return res.json({ message: "An error occurred" });
        }
        return res.json({ message: `Successfully resolved ${hostname}` });
    });
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
