import fs from 'node:fs';
import { XmlDocument,XsdValidator } from 'libxml2-wasm';

const doc = XmlDocument.fromBuffer(fs.readFileSync('vallalat.xml'));
const schema = XmlDocument.fromBuffer(fs.readFileSync('vallalat.xsd'));
const validator = XsdValidator.fromDoc(schema);

try {
    validator.validate(doc);
    console.log("The file is valid");
} catch (err) {
    console.log(err.details);
}

doc.dispose();
validator.dispose();
schema.dispose();