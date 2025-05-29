import express, { json } from "express";
const app = express();
const PORT = 3000;

app.use(json())

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));

app.get("/", (req, res) => {
    res.send({msg: "Hello, World!"});
})

app.post("/data", (req, res) =>{
    console.log(req.body);
    res.send({status: "Data received"});
}) 