import fs from 'node:fs';
import { XmlDocument,XsdValidator,XmlValidateError } from 'libxml2-wasm';



const doc1 = XmlDocument.fromBuffer(fs.readFileSync('vallalat.xml'));


const schema = XmlDocument.fromBuffer(fs.readFileSync('vallalat.xsd'));
const validator = XsdValidator.fromDoc(schema);

try {
    validator.validate(doc1);
} catch (err) {
    console.log(err.details);
}




doc1.dispose();
validator.dispose();
schema.dispose();