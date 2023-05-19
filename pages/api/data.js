import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { filename } = req.query;
  const filePath = path.join(process.cwd(), 'database', `${filename}.json`);

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "");
  }

  if (req.method === 'GET') {
    // read the data from the file and send it as the response
    const data = fs.readFileSync(filePath, 'utf-8');
    res.status(200).json(JSON.parse(data));
  } else if (req.method === 'POST') {
    // update the data in the file and send the updated data as the response
    const newData = req.body;
    fs.writeFileSync(filePath, JSON.stringify(newData));
    res.status(200).json(newData);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}