/* eslint-disable header/header */
// [object Object]
// SPDX-License-Identifier: Apache-2.0
import * as  Web3  from 'web3';

export { Contract } from 'web3-eth-contract';
export { OpenSeaAPI } from './api';
export { OpenSeaPort } from './seaport';
export * from './types';
 /* { OpenSeaCollection, OpenSeaAsset, EventType, Network, OpenSeaAPIConfig}  */ 
export { orderToJSON, orderFromJSON, WyvernProtocol } from './utils/utils';
export {
  encodeCall,
  encodeSell, encodeAtomicizedBuy, encodeAtomicizedSell,
  encodeDefaultCall, encodeReplacementPattern,
  AbiType
} from './utils/schema';

export { Web3 };


/**
 * Example setup:
 *
 * import * as Web3 from 'web3'
 * import { OpenSeaPort, Network } from 'opensea-js'
 * const provider = new Web3.providers.HttpProvider('https://mainnet.infura.io')
 * const client = new OpenSeaPort(provider, {
 *   networkName: Network.Main
 * })
 */

/* export {
  // Main SDK export:
  OpenSeaPort,
  // So the API could be used separately:
  OpenSeaAPI
  // Useful for serializing and deserializing orders:
  // Types to help initialize SDK and listen to events.
  // Can also be imported using e.g.
  //   import { EventType } from 'opensea-js/lib/types'
};
export  { EventData } from "./types";
export   { OpenSeaAPIConfig } ;

export { EventType, Network };
 */