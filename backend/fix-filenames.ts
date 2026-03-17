import { createConnection } from 'typeorm';
import { File } from './src/entities/file.entity';

async function fixFilenames() {
  const connection = await createConnection({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: 5432,
    username: 'school_archive',
    password: 'school_archive_password',
    database: 'school_archive',
    entities: [File],
  });

  const files = await connection.getRepository(File).find();
  
  for (const file of files) {
    // 尝试修复编码：从 latin1 转回 utf-8
    try {
      const fixed = Buffer.from(file.originalName, 'latin1').toString('utf8');
      if (fixed !== file.originalName && !fixed.includes('�')) {
        console.log(`Fixing ${file.id}: ${file.originalName} -> ${fixed}`);
        file.originalName = fixed;
        await connection.getRepository(File).save(file);
      }
    } catch (e) {
      console.log(`Skip ${file.id}: already correct or cannot fix`);
    }
  }
  
  await connection.close();
}

fixFilenames();
