import express from 'express';
import cors from 'cors';
import sharp from 'sharp';
import multer from 'multer';
import { promises as fs } from 'fs';
import path from 'path';
const app = express();
app.use(cors());
app.use(express.json());
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('image'), async (req, res) => {
    if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
    }

    const filePath = path.join(__dirname, 'uploads', req.file.filename);
    const format = req.body.format || 'jpeg'; // Default format is JPEG
    const quality = req.body.quality || 70; // Lower quality for preview

    const processedImagePath = `${filePath}-preview.${format}`;
    await sharp(filePath)
        .resize({ width: 400 })
        .toFormat(format, { quality })
        .toFile(processedImagePath);

    res.json({ preview: processedImagePath });
});

app.post('/process', async (req, res) => {
    const { file, brightness, contrast, saturation, rotation, format } = req.body;

    const imagePath = path.join(__dirname, 'uploads', file);
    const outputFilePath = `${imagePath}-final.${format || 'jpeg'}`;

    let image = sharp(imagePath)
        .modulate({ brightness, saturation }) // Adjust brightness and saturation
        .rotate(rotation)
        .toFormat(format || 'jpeg');

    if (contrast) {
        // Contrast adjustment using linear: apply a contrast transformation
        image = image.linear(contrast, -(0.5 * contrast) + 0.5);
    }

    await image.toFile(outputFilePath);
    res.json({ final: outputFilePath });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
