const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const multer = require("multer");
const cors = require("cors");
const TeachableMachine = require("@patrick-paludo/teachablemachine-node");

const model = new TeachableMachine({
  modelUrl: "https://teachablemachine.withgoogle.com/models/UlxNRSbyf/",
});

const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan("combined"));
app.use(compression());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/api/classify", upload.single("image"), async (req, res) => {
  console.log("Iniciado o processamento...");
  try {
    console.log(model);
    if (!model) {
      return res.status(500).json({
        error: "Model not loaded",
      });
    }

    const base64 = `data:image/${
      req.file.mimetype
    };base64,${req.file.buffer.toString("base64")}`;
    model
      .classify({
        // imageUrl: base64,
        imageFile: req.file,
      })
      .then((predictions) => {
        console.log("PREDICTIONS: ", predictions);
        return res.json({
          success: true,
          result: {
            product: predictions[0].class,
            probability: parseFloat(predictions[0].score * 100).toFixed(2),
          },
        });
      })
      .catch((error) => {
        console.log(error);
        return res.status(500).json({
          success: false,
          error: error,
        });
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: error,
    });
  }
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
