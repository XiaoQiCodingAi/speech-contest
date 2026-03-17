"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const file_entity_1 = require("./src/entities/file.entity");
async function fixFilenames() {
    const connection = await (0, typeorm_1.createConnection)({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: 5432,
        username: 'school_archive',
        password: 'school_archive_password',
        database: 'school_archive',
        entities: [file_entity_1.File],
    });
    const files = await connection.getRepository(file_entity_1.File).find();
    for (const file of files) {
        try {
            const fixed = Buffer.from(file.originalName, 'latin1').toString('utf8');
            if (fixed !== file.originalName && !fixed.includes('�')) {
                console.log(`Fixing ${file.id}: ${file.originalName} -> ${fixed}`);
                file.originalName = fixed;
                await connection.getRepository(file_entity_1.File).save(file);
            }
        }
        catch (e) {
            console.log(`Skip ${file.id}: already correct or cannot fix`);
        }
    }
    await connection.close();
}
fixFilenames();
//# sourceMappingURL=fix-filenames.js.map