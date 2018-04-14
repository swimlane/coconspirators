import { expect, assert } from 'chai';
import { AmqpClient } from '../src/client';

describe('AmqpClient', () => {
  xit('should throw an error if you try to disconnect before connecting', async () => {
    const client = new AmqpClient();
    try {
      await client.disconnect();
      assert.fail();
    } catch (err) {
      expect(err.message).to.equal('Connection has not been established');
    }
  });
});
