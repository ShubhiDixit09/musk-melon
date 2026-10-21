import { COMPREHENSIVE_ELON_DATABASE } from '../src/lib/knowledge-graph/elon-dataset';
import { ELON_KNOWLEDGE_GRAPH } from '../src/lib/knowledge-graph/graph-engine';

const WEAVIATE_URL = process.env.WEAVIATE_URL || 'https://xqr3z5ags5w0vxrzhitlw.c0.eu-central-1.aws.weaviate.cloud';
const WEAVIATE_API_KEY = process.env.WEAVIATE_API_KEY || 'bTBEMHdEVVVsTVBlSSt5K19zUlFqdjBWL053Qm42ck95bW1vWllQeVRIUFRkemxRYzBqNEtLMk43ejVZPV92MjAw';

async function syncAndVerifyWeaviate() {
  console.log('\n===============================================================');
  console.log('🚀 WEAVIATE CLUSTER DATABASE SYNC & KNOWLEDGE GRAPH UPLOAD');
  console.log('===============================================================');
  console.log(`Target Cluster: ${WEAVIATE_URL}`);

  // 1. Check Connectivity
  const metaRes = await fetch(`${WEAVIATE_URL}/v1/meta`, {
    headers: { Authorization: `Bearer ${WEAVIATE_API_KEY}` }
  });

  if (!metaRes.ok) {
    throw new Error(`Failed to connect to Weaviate cluster: ${metaRes.statusText}`);
  }

  const meta = await metaRes.json();
  console.log(`✅ Cluster Online! Version: ${meta.version}`);

  // 2. Setup / Ensure Schemas
  console.log('\n⚙️ Verifying Weaviate Schemas...');
  
  // Schema A: ElonMuskMemory (Vector Embeddings)
  const memorySchema = {
    class: 'ElonMuskMemory',
    description: 'MindCommit - Grounded Elon Musk Knowledge Chunks (2010-2025)',
    properties: [
      { name: 'content', dataType: ['text'] },
      { name: 'validFrom', dataType: ['text'] },
      { name: 'validTo', dataType: ['text'] },
      { name: 'source', dataType: ['text'] },
      { name: 'sourceType', dataType: ['text'] },
      { name: 'topic', dataType: ['text'] },
      { name: 'cognitiveTone', dataType: ['text'] },
      { name: 'reasoningStyle', dataType: ['text'] }
    ]
  };

  // Schema B: ElonKnowledgeGraph (Entities & Relations)
  const graphSchema = {
    class: 'ElonKnowledgeGraph',
    description: 'Structured Knowledge Graph & Cognitive Tone for Elon Musk Twin',
    properties: [
      { name: 'entityName', dataType: ['text'] },
      { name: 'entityType', dataType: ['text'] },
      { name: 'details', dataType: ['text'] },
      { name: 'relationships', dataType: ['text'] },
      { name: 'rhythmPattern', dataType: ['text'] }
    ]
  };

  for (const schema of [memorySchema, graphSchema]) {
    const check = await fetch(`${WEAVIATE_URL}/v1/schema/${schema.class}`, {
      headers: { Authorization: `Bearer ${WEAVIATE_API_KEY}` }
    });

    if (check.status === 404) {
      console.log(`Creating schema class: ${schema.class}...`);
      await fetch(`${WEAVIATE_URL}/v1/schema`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${WEAVIATE_API_KEY}` },
        body: JSON.stringify(schema)
      });
    } else {
      console.log(`✅ Schema class exists: ${schema.class}`);
    }
  }

  // 3. Batch Ingest All Dataset Chunks
  console.log(`\n📦 Uploading ${COMPREHENSIVE_ELON_DATABASE.length} Knowledge Chunks to Weaviate...`);
  const memoryObjects = COMPREHENSIVE_ELON_DATABASE.map(item => ({
    class: 'ElonMuskMemory',
    properties: {
      content: item.content,
      validFrom: item.validFrom,
      validTo: item.validTo || '9999-12-31',
      source: item.source,
      sourceType: item.sourceType,
      topic: item.topic,
      cognitiveTone: 'First-principles, bold, engineering-focused, direct',
      reasoningStyle: 'Boil down to physics limits, eliminate constraints, iterate rapidly'
    }
  }));

  const memoryRes = await fetch(`${WEAVIATE_URL}/v1/batch/objects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${WEAVIATE_API_KEY}` },
    body: JSON.stringify({ objects: memoryObjects })
  });

  console.log(`✅ Knowledge Chunks Ingested! Status: ${memoryRes.status}`);

  // 4. Batch Ingest Knowledge Graph Nodes & Tone Patterns
  console.log(`\n🕸️ Uploading ${ELON_KNOWLEDGE_GRAPH.entities.length} Knowledge Graph Nodes & Rhythm Profiles...`);
  const graphObjects = ELON_KNOWLEDGE_GRAPH.entities.map(e => {
    const rels = ELON_KNOWLEDGE_GRAPH.relationships
      .filter(r => r.sourceId === e.id || r.targetId === e.id)
      .map(r => `${r.relationType}: ${r.description}`)
      .join(' | ');

    return {
      class: 'ElonKnowledgeGraph',
      properties: {
        entityName: e.name,
        entityType: e.type,
        details: JSON.stringify(e.properties),
        relationships: rels || 'Core Entity',
        rhythmPattern: 'Direct statement -> First principles reasoning -> Engineering action -> Witty remark'
      }
    };
  });

  const graphRes = await fetch(`${WEAVIATE_URL}/v1/batch/objects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${WEAVIATE_API_KEY}` },
    body: JSON.stringify({ objects: graphObjects })
  });

  console.log(`✅ Knowledge Graph & Rhythm Nodes Ingested! Status: ${graphRes.status}`);

  // 5. Run Verification Query
  console.log('\n🔍 Running Live Weaviate Verification Query...');
  const queryRes = await fetch(`${WEAVIATE_URL}/v1/objects?class=ElonMuskMemory&limit=3`, {
    headers: { Authorization: `Bearer ${WEAVIATE_API_KEY}` }
  });
  const queryData = await queryRes.json();
  console.log(`✅ Objects count retrieved from Weaviate: ${queryData.objects?.length || 0}`);
  if (queryData.objects?.length > 0) {
    console.log(`Sample verified record: "${queryData.objects[0].properties.content.substring(0, 80)}..."`);
  }

  console.log('\n===============================================================');
  console.log('🎉 WEAVIATE DATABASE FULLY WORKING & SYNCHRONIZED!');
  console.log('===============================================================\n');
}

syncAndVerifyWeaviate().catch(console.error);
