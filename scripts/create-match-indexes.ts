import dbConnect from '@/lib/mongodb';
import Match from '@/models/match-model';

async function createMatchIndexes() {
  try {
    await dbConnect();

    // Create indexes for better query performance
    await Match.collection.createIndex({ data: -1 });
    await Match.collection.createIndex({ 'timeA.jogadores.cpf': 1 });
    await Match.collection.createIndex({ 'timeB.jogadores.cpf': 1 });
    await Match.collection.createIndex({ status: 1 });
    await Match.collection.createIndex({ registradoPor: 1 });

    console.log('Match indexes created successfully');
  } catch (error) {
    console.error('Error creating match indexes:', error);
  }
}

createMatchIndexes();
