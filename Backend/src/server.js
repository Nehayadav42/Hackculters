
import dotenv from "dotenv";
import app from "./app.js";

const PORT = process.env.PORT || 5000;

// connectDB()
//     .then(() => {
//         app.listen(PORT, () => {
//             console.log(`Server running on port ${PORT}`);
//         });
//     })
//     .catch(err => {
//         console.error("Database connection failed", err);
//     });

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
