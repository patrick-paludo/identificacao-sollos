import * as tf from "@tensorflow/tfjs";
import * as tmImage from "@teachablemachine/image";

const modelFile = "./models/model.json";
const modelMetadataFile = "./models/metadata.json";

const model = await tmImage.load(modelFile, modelMetadataFile);
