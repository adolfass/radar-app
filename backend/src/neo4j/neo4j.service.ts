import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import neo4j, { Driver, Session } from 'neo4j-driver';

@Injectable()
export class Neo4jService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(Neo4jService.name);
  private driver: Driver;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const uri = this.configService.get('NEO4J_URI', 'bolt://localhost:7687');
    const user = this.configService.get('NEO4J_USER', 'neo4j');
    const password = this.configService.get('NEO4J_PASSWORD', 'neo4j_password');

    this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

    try {
      await this.driver.verifyConnectivity();
      this.logger.log('Connected to Neo4j');
    } catch (error) {
      this.logger.warn('Failed to connect to Neo4j, falling back to PostgreSQL');
    }
  }

  async onModuleDestroy() {
    await this.driver.close();
  }

  getDriver(): Driver {
    return this.driver;
  }

  getSession(): Session {
    return this.driver.session();
  }

  async run(query: string, params?: Record<string, any>) {
    const session = this.getSession();
    try {
      const result = await session.run(query, params);
      return result;
    } finally {
      await session.close();
    }
  }

  async syncContact(userId: number, contact: any) {
    const query = `
      MERGE (u:User {id: $userId})
      MERGE (c:Contact {id: $contactId, userId: $userId})
      SET c.businessName = $businessName,
          c.circle = $circle,
          c.archetype = $archetype,
          c.lastInteraction = $lastInteraction,
          c.updatedAt = datetime()
      MERGE (u)-[:HAS_CONTACT]->(c)
    `;

    await this.run(query, {
      userId,
      contactId: contact.id,
      businessName: contact.businessName || null,
      circle: contact.circle || null,
      archetype: contact.archetype || null,
      lastInteraction: contact.lastInteraction
        ? new Date(contact.lastInteraction).toISOString()
        : null,
    });
  }

  async syncTrustInteraction(userId: number, contactId: number, delta: number) {
    const query = `
      MATCH (u:User {id: $userId})-[:HAS_CONTACT]->(c:Contact {id: $contactId})
      MERGE (u)-[r:TRUSTS {contactId: $contactId}]->(c)
      SET r.balance = coalesce(r.balance, 0) + $delta,
          r.updatedAt = datetime()
    `;

    await this.run(query, { userId, contactId, delta });
  }

  async getNetworkInsights(userId: number) {
    const query = `
      MATCH (u:User {id: $userId})-[:HAS_CONTACT]->(c:Contact)
      OPTIONAL MATCH (u)-[t:TRUSTS {contactId: c.id}]->(c)
      RETURN c.id AS id,
             c.businessName AS name,
             c.circle AS circle,
             c.archetype AS archetype,
             coalesce(t.balance, 0) AS trustBalance,
             c.lastInteraction AS lastInteraction
      ORDER BY trustBalance DESC
    `;

    const result = await this.run(query, { userId });
    return result.records.map((record) => ({
      id: record.get('id').toNumber(),
      name: record.get('name'),
      circle: record.get('circle'),
      archetype: record.get('archetype'),
      trustBalance: record.get('trustBalance').toNumber(),
      lastInteraction: record.get('lastInteraction'),
    }));
  }

  async getShortestPath(userId: number, contactIdA: number, contactIdB: number) {
    const query = `
      MATCH path = shortestPath(
        (a:Contact {id: $contactIdA, userId: $userId})-[:TRUSTS*1..5]-(b:Contact {id: $contactIdB, userId: $userId})
      )
      RETURN path
    `;

    const result = await this.run(query, { userId, contactIdA, contactIdB });
    if (result.records.length === 0) return null;

    const path = result.records[0].get('path');
    return {
      length: path.length,
      nodes: path.nodes.map((n: any) => n.properties),
      relationships: path.relationships.map((r: any) => r.properties),
    };
  }
}
