import { log } from '@graphprotocol/graph-ts/index'
import { PoolAdded } from '../generated/AddressProvider/CryptoRegistry'
import { ADDRESS_ZERO } from '../../../packages/constants'
import { TokenExchange } from '../generated/templates/RegistryTemplate/CurvePoolV2'
import { createNewRegistryPool } from './services/pools'
import { MetaPool } from '../generated/templates/RegistryTemplate/MetaPool'
import { getLpToken } from './mapping'
import { handleExchange } from './services/swaps'

export function handleCryptoPoolAdded(event: PoolAdded): void {
  log.debug('New V2 factory crypto pool {} deployed at {}', [
    event.params.pool.toHexString(),
    event.transaction.hash.toHexString(),
  ])
  const pool = event.params.pool

  // Useless for now, but v2 metapools may be a thing at some point
  const testMetaPool = MetaPool.bind(pool)
  const testMetaPoolResult = testMetaPool.try_base_pool()
  if (!testMetaPoolResult.reverted) {
    createNewRegistryPool(
      pool,
      testMetaPoolResult.value,
      getLpToken(pool, event.address),
      true,
      true,
      event.block.timestamp,
      event.block.number,
      event.transaction.hash
    )
  } else {
    createNewRegistryPool(
      pool,
      ADDRESS_ZERO,
      getLpToken(pool, event.address),
      false,
      true,
      event.block.timestamp,
      event.block.number,
      event.transaction.hash
    )
  }
}

export function handleTokenExchangeV2(event: TokenExchange): void {
  log.debug('swap for v2 pool: {} at {}', [event.address.toHexString(), event.transaction.hash.toHexString()])
  const trade = event.params

  handleExchange(
    trade.buyer,
    trade.sold_id,
    trade.bought_id,
    trade.tokens_sold,
    trade.tokens_bought,
    event.block.timestamp,
    event.block.number,
    event.address,
    event.transaction.hash,
    false
  )
}
