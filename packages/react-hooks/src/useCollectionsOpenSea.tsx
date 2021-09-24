// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable */
// eslint-disable-next-line simple-import-sort/imports
import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';
import type { ErrorType } from '@polkadot/react-hooks/useFetch';
import type { TokenDetailsInterface } from '@polkadot/react-hooks/useToken';

import BN from 'bn.js';
import { useCallback, useEffect, useRef, useState, useContext } from 'react';

import { Filters } from '@polkadot/app-nft-market/containers/NftMarket';
import { OpenSeaAPI, OpenSeaAPIConfig, OpenSeaCollection, Order, OpenSeaPort, Network , Web3, Contract } from 'opensea-js';

import envConfig from '@polkadot/apps-config/envConfig';
import { useApi, useCollection, useFetch } from '@polkadot/react-hooks';
import { base64Decode, encodeAddress } from '@polkadot/util-crypto';

import { StatusContext } from '@polkadot/react-components';
import { ProtobufAttributeType } from '@polkadot/react-components/util/protobufUtils';
import { useDecoder } from '@polkadot/react-hooks/useDecoder';
import { strToUTF16 } from '@polkadot/react-hooks/utils';

export type SchemaVersionTypes = 'ImageURL' | 'Unique';

const { canAddCollections, openseaApi, uniqueCollectionIds } = envConfig;

export type MetadataType = {
  metadata?: string;
}

export interface TokenInterface extends TokenDetailsInterface {
  collectionId: string;
  id: string;
}

export type OfferType = {
  collectionId: number;
  price: BN;
  seller: string;
  tokenId: string;
  metadata: any;
}

export type OffersResponseType = {
  items: OfferType[];
  itemsCount: number;
  page: number;
  pageSize: number;
}

export type HoldType = {
  collectionId: number;
  tokenId: string;
  owner: string;
}

export type HoldResponseType = {
  items: HoldType[];
  itemsCount: number;
  page: number;
  pageSize: number;
}

export type TradeType = {
  buyer?: string;
  collectionId: number;
  metadata: string
  price: string;
  quoteId: number;
  seller: string;
  tradeDate: string; // 2021-03-25T08:50:49.622992
  tokenId: number;
}

export type TradesResponseType = {
  items: TradeType[];
  itemsCount: number;
  page: number;
  pageSize: number;
}

export type CollectionWithTokensCount = { info: NftCollectionInterface, tokenCount: number };

interface TransactionCallBacks {
  onFailed?: () => void;
  onStart?: () => void;
  onSuccess?: () => void;
  onUpdate?: () => void;
}

export interface OSnftCollectionInterface extends NftCollectionInterface, OpenSeaCollection
{
}

export function useCollectionsOpenSea() {
  const { api } = useApi();
  const { fetchData } = useFetch();
  const [error, setError] = useState<ErrorType>();
  const [offers, setOffers] = useState<{ [key: string]: OfferType }>({});
  const [myHold, setMyHold] = useState<{ [key: string]: HoldType[] }>({});
  const [offersLoading, setOffersLoading] = useState<boolean>(false);
  const [holdLoading, setHoldLoading] = useState<boolean>(false);
  const [offersCount, setOffersCount] = useState<number>();
  const [trades, setTrades] = useState<TradeType[]>();
  const [tradesLoading, setTradesLoading] = useState<boolean>(false);
  const [myTrades, setMyTrades] = useState<TradeType[]>();
  const cleanup = useRef<boolean>(false);
  //  const { getDetailedCollectionInfo } = useCollection();
  const { queueExtrinsic } = useContext(StatusContext);
  const { hex2a } = useDecoder();




  //var Web3HttpProvider = require('web3-providers-http');

  //const HDWalletProvider = require("@truffle/hdwallet-provider");
  const BridgeGate = require('../../../../bridge2unique/build/contracts/BridgeGate.json');

  //TODO: move to config! 
  // SeaPort API
  const provider = new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/3362483b5eab409ea69e99f99aefd67a')
  const accountAddress = "0xa0df350d2637096571F7A701CBc1C5fdE30dF76A" // The buyer's wallet address, also the taker
  const recipientAddress = "0xa0df350d2637096571F7A701CBc1C5fdE30dF76A"
  const referrerAddress = "0xa0df350d2637096571F7A701CBc1C5fdE30dF76A"
  const pk = ["b8c1b5c1d81f9475fdf2e334517d29f733bdfa40682207571b12fc1142cbf329"]
  const seaport = new OpenSeaPort(provider, {
    networkName: Network.Main
})

//Uniq frontier API
const  chain1 = 999// myArgs[0];
const  chain2  = 8888 // myArgs[1];
const contr2 = require("../../../../bridge2unique/nets/"+chain2+"-bridge.json");
//const  accounts = contr.account;
const endpoint2 = contr2.endpoint;



async function  transferFromBridge (txhash:string, whom:string, token:string,  idNFT:string) {
  var options = {
      timeout: 30000, // ms
  
      clientConfig: {
        // Useful if requests are large
        maxReceivedFrameSize: 100000000,   // bytes - default: 1MiB
        maxReceivedMessageSize: 100000000, // bytes - default: 8MiB
  
        // Useful to keep a connection alive
        keepalive: true,
        keepaliveInterval: 60000 // ms
      },
  
      // Enable auto reconnection
      reconnect: {
          auto: true,
          delay: 5000, // ms
          maxAttempts: 5,
          onTimeout: false
      }, 
      useSkipCache: false
  };
      // const provider = new Web3HttpProvider(endpoint2, options);
      //const provider = new Web3WsProvider(endpoint2, options);

    Contract.setProvider(endpoint2);

    const pb2 = new Contract(BridgeGate.abi, contr2.pb);
  
  /*    const myAccount = contr2.account; //web3.eth.accounts.privateKeyToAccount(pk2);
    console.log ("asking about Tx:", txhash, "from: ", myAccount )
  const tranzactionIsNotDone = await pb2.methods.tranzactionIsNotDone(chain1, txhash).call({from: myAccount, gasPrice: '0x01', gas: '25000000000'}); 
  console.log ("tranzactionIsNotDone", tranzactionIsNotDone)
  if (tranzactionIsNotDone)
   */ {
      console.log ("transfering Tx:", txhash)
     // const providerS =  new HDWalletProvider({
     // privateKeys: pk ,  
     // providerOrUrl:  endpoint2});

     // ver Web2 API <1
     
     const web3 = new Web3(new Web3.providers.HttpProvider(endpoint2))
     
     // const providerS = new Web3HttpProvider(endpoint2, options);
      // const web3 = new Web3(providerS);  

      // ver Web3 API 0.20.7,  <1 
      const pb =  web3.eth.contract(BridgeGate.abi);
      const pb21 =  pb.at(contr2.pb);

     // ver Web3 API >1
//    const pb21 = new web3.eth.Contract(BridgeGate.abi, contr2.pb, {from: accountAddress, gasPrice: '0x01'});

      const payload =  await pb21.methods.transfer(chain1, txhash, whom, token,  idNFT).send({from: accountAddress, gasPrice: '0x01'})
      console.log (payload)
         var encodedABI = payload.encodeABI();

      var tx = {
        from: accountAddress,
        to: contr2.pb,
        gas: 2000000,
        gasPrice: '0x01',
        data: encodedABI
      }; 
    
      web3.eth.accounts.signTransaction(tx, pk).then(signed => {
      var tran = web3.eth.sendSignedTransaction(signed.rawTransaction);
    
         tran.on('transactionHash', hash => {
          console.log('hash');
          console.log(hash);
        });
    
        tran.on('receipt', receipt => {
          console.log('reciept');
          console.log(receipt);
        });
    
        tran.on('error', console.error);
      })
  }
}

const mintOnUniq = useCallback(async (asset_contract_address: string, token_id: string) => {
  
    const tx_hash = asset_contract_address + token_id 
    try
    {
      transferFromBridge ( tx_hash, 
                          recipientAddress, 
                          asset_contract_address,  
                          token_id)

      
    } catch (e) {
      console.log('getOrder error', e);
    }

    //   return [];
  }, []);

  const getAssets = useCallback(async (query?: Record<string, unknown>, page?: number) => {
  /*    if (!api || !collectionId || !ownerId) {
      return [];
    } */
    const osAPIConf = openseaApi as OpenSeaAPIConfig;
    const osAPI = new OpenSeaAPI(osAPIConf);
    let assets;

    try
    {
      assets = await osAPI.getAssets(query, page);

      return assets;
    } catch (e) {
      console.log('getAssets error', e);
    }

    //   return [];
  }, []);

  const getOrder = useCallback(async (asset_contract_address: string, token_id: number) => {
    /**
     *   asset_contract_address: tokenAddress,
  token_id: token_id,
  side: OrderSide.Buy
     */
    /*    if (!api || !collectionId || !ownerId) {
        return [];
      } */
      const osAPIConf = openseaApi as OpenSeaAPIConfig;
      const osAPI = new OpenSeaAPI(osAPIConf);
  
      try
      {
        const { orders, count } = await seaport.api.getOrders({
          asset_contract_address: asset_contract_address,
          token_id: token_id,
          side:  0 //OrderSide.Buy
        })
        return {orders, count}
        
      } catch (e) {
        console.log('getOrder error', e);
      }
  
      //   return [];
    }, []);

  const fullFillOrder = useCallback(async (order: Order) => {
    const osAPIConf = openseaApi as OpenSeaAPIConfig;
    const osAPI = new OpenSeaAPI(osAPIConf);
    

    try
    {
      const transactionHash = await this.props.seaport.fulfillOrder({ order, accountAddress, recipientAddress, referrerAddress })
      if (transactionHash !== undefined) {
        console.log ("succsess bought of order ", order)
        }
      } catch (e) {
        console.log('fullFillOrder error', e);
      }
  
      //   return [];
    }, []);
  const getCollections = useCallback(async (query?: Record<string, unknown>, page?: number) => {
    /*    if (!api || !collectionId || !ownerId) {
         return [];
       } */
    const osAPIConf = openseaApi as OpenSeaAPIConfig;
    const osAPI = new OpenSeaAPI(osAPIConf);

    try {
      return await osAPI.getCollections(query, page);
    } catch (e) {
      console.log('getcollections error', e);
    }
  }, []);

  const getTokensOfCollection = useCallback(async (collectionId: string, ownerId: string) => {
    if (!api || !collectionId || !ownerId) {
      return [];
    }

    try {
      return await api.query.nft.addressTokens(collectionId, ownerId);
    } catch (e) {
      console.log('getTokensOfCollection error', e);
    }

    return [];
  }, [api]);

  /**
   * Return the list of token sale offers
   */
  const getOffers = useCallback((page: number, pageSize: number, filters?: Filters) => {
    try {
      let url = `${openseaApi}/assets/`; //?page=${page}&pageSize=${pageSize}`;

      // reset offers before loading first page
      if (page === 1) {
        setOffers({}); 
      }

      if (filters) {
        Object.keys(filters).forEach((filterKey: string) => {
          const currentFilter: string | string[] | number = filters[filterKey];

          if (Array.isArray(currentFilter)) {
            if (filterKey === 'collectionIds') {
              if (!currentFilter?.length) {
                url = `${url}${envConfig.uniqueCollectionIds.map((item: string) => `&collectionId=${item}`).join('')}`;
              } else {
                url = `${url}${currentFilter.map((item: string) => `&collectionId=${item}`).join('')}`;
              }
            } else if (filterKey === 'traitsCount') {
              url = `${url}${currentFilter.map((item: string) => `&traitsCount=${item}`).join('')}`;
            }
          } else {
            url += `&${filterKey}=${currentFilter}`;
          }
        });
      }

      fetchData<OffersResponseType>(url).subscribe((result: OffersResponseType | ErrorType) => {
        if (cleanup.current) {
          setOffersLoading(false);

          return;
        }

        if ('error' in result) {
          setError(result);
        } else {
          if (result) {
            setOffersCount(result.itemsCount);

            if (result.itemsCount === 0) {
              setOffers({});
            } else if (result.items.length) {
              setOffers((prevState: {[key: string]: OfferType}) => {
                const newState = { ...prevState };

                result.items.forEach((offer: OfferType) => {
                  if (!newState[`${offer.collectionId}-${offer.tokenId}`]) {
                    newState[`${offer.collectionId}-${offer.tokenId}`] = { ...offer, seller: encodeAddress(base64Decode(offer.seller)) };
                  }
                });

                return newState;
              });
            }
          }
        }

        setOffersLoading(false);
      });
    } catch (e) {
      console.log('getOffers error', e);
      setOffersLoading(false);
    }
  }, [fetchData]);

  /**
   * Return the list of token were hold on the escrow
   */
  const getHoldByMe = useCallback((account: string, page: number, pageSize: number, collectionIds?: string[]) => {
    try {
      let url = `${openseaApi}/OnHold/${account}?page=${page}&pageSize=${pageSize}`;

      if (!canAddCollections && collectionIds && collectionIds.length) {
        url = `${url}${collectionIds.map((item: string) => `&collectionId=${item}`).join('')}`;
      }

      setHoldLoading(true);
      fetchData<HoldResponseType>(url).subscribe((result: HoldResponseType | ErrorType) => {
        if (cleanup.current) {
          setHoldLoading(false);

          return;
        }

        if ('error' in result) {
          setError(result);
          setMyHold({});
        } else {
          if (result?.items.length) {
            const newState: { [key: string]: HoldType[] } = {};

            result.items.forEach((hold: HoldType) => {
              if (!newState[hold.collectionId]) {
                newState[hold.collectionId] = [];
              }

              if (!newState[hold.collectionId].find((holdItem) => holdItem.tokenId === hold.tokenId)) {
                newState[hold.collectionId].push(hold);
              }
            });

            setMyHold(newState);
          } else {
            setMyHold({});
          }
        }

        setHoldLoading(false);
      });
    } catch (e) {
      console.log('getOffers error', e);
      setHoldLoading(false);
    }
  }, [fetchData]);
  const getDetailedCollectionInfo = useCallback(async (collectionId: string) => {
    if (!api) {
      return null;
    }

    try {
      const collectionInfo = (await api.query.nft.collectionById(collectionId)).toJSON() as unknown as NftCollectionInterface;

      return {
        ...collectionInfo,
        id: collectionId
      };
    } catch (e) {
      console.log('getDetailedCollectionInfo error', e);
    }

    return {};
  }, [api]);

  /**
   * Return the list of token trades
   */
  const getTrades = useCallback(({ account,
    collectionIds,
    page,
    pageSize }: { account?: string, collectionIds?: string[], page: number, pageSize: number }) => {
    try {
      let url = `${openseaApi}/trades`;

      if (account && account.length) {
        url = `${url}/${account}`;
      }

      url = `${url}?page=${page}&pageSize=${pageSize}`;

      if (!canAddCollections && collectionIds && collectionIds.length) {
        url = `${url}${collectionIds.map((item: string) => `&collectionId=${item}`).join('')}`;
      }

      setTradesLoading(true);
      fetchData<TradesResponseType>(url).subscribe((result: TradesResponseType | ErrorType) => {
        if (cleanup.current) {
          setTradesLoading(false);

          return;
        }

        if ('error' in result) {
          setError(result);
        } else {
          if (!account || !account.length) {
            setTrades(result.items);
          } else {
            setMyTrades(result.items);
          }
        }

        setTradesLoading(false);
      });
    } catch (e) {
      console.log('getTrades error', e);
      setTradesLoading(false);
    }
  }, [fetchData]);

  const presetTokensCollections = useCallback(async (): Promise<NftCollectionInterface[]> => {
    if (!api) {
      return [];
    }

    try {
      const createdCollectionCount = (await api.query.nft.createdCollectionCount() as unknown as BN).toNumber();
      const destroyedCollectionCount = (await api.query.nft.destroyedCollectionCount() as unknown as BN).toNumber();
      const collectionsCount = createdCollectionCount - destroyedCollectionCount;
      const collections: Array<NftCollectionInterface> = [];

      for (let i = 1; i <= collectionsCount; i++) {
        const collectionInf = await getDetailedCollectionInfo(i.toString()) as unknown as NftCollectionInterface;

        if (cleanup.current) {
          return [];
        }

        if (collectionInf && collectionInf.Owner && collectionInf.Owner.toString() !== '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM') {
          collections.push({ ...collectionInf, id: i.toString() });
        }
      }

      return collections;
    } catch (e) {
      console.log('preset tokens collections error', e);

      return [];
    }
  }, [api, getDetailedCollectionInfo]);

  const getCollectionWithTokenCount = useCallback(async (collectionId: string): Promise<CollectionWithTokensCount> => {
    const info = (await getDetailedCollectionInfo(collectionId)) as unknown as NftCollectionInterface;
    const tokenCount = ((await api.query.nft.itemListIndex(collectionId)) as unknown as BN).toNumber();

    return {
      info,
      tokenCount
    };
  }, [api.query.nft, getDetailedCollectionInfo]);

  /* const getAllCollectionsWithTokenCount = useCallback(async () => {
    const createdCollectionCount = (await api.query.nft.createdCollectionCount() as unknown as BN).toNumber();
    const destroyedCollectionCount = (await api.query.nft.destroyedCollectionCount() as unknown as BN).toNumber();
    const collectionsCount = createdCollectionCount - destroyedCollectionCount;
    const collectionWithTokensCount: { [key: string]: CollectionWithTokensCount } = {};

    for (let i = 1; i <= collectionsCount; i++) {
      collectionWithTokensCount[i] = await getCollectionWithTokenCount(i.toString());
    }

    return collectionWithTokensCount;
  }, [api.query.nft, getCollectionWithTokenCount]); */

  const presetCollections = useCallback(async (): Promise<NftCollectionInterface[]> => {
    try {
      const collections: Array<NftCollectionInterface> = canAddCollections ? JSON.parse(localStorage.getItem('tokenCollections') || '[]') as NftCollectionInterface[] : [];

      if (uniqueCollectionIds && uniqueCollectionIds.length) {
        for (let i = 0; i < uniqueCollectionIds.length; i++) {
          const mintCollectionInfo = await getDetailedCollectionInfo(uniqueCollectionIds[i]) as unknown as NftCollectionInterface;

          if (cleanup.current) {
            return [];
          }

          if (mintCollectionInfo && mintCollectionInfo.Owner && mintCollectionInfo.Owner.toString() !== '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM' && !collections.find((collection) => collection.id === uniqueCollectionIds[i])) {
            collections.push({ ...mintCollectionInfo, id: uniqueCollectionIds[i] });
          }
        }

        localStorage.setItem('tokenCollections', JSON.stringify(collections));
      }

      return collections;
    } catch (e) {
      console.log('presetTokensCollections error', e);

      return [];
    }
  }, [getDetailedCollectionInfo]);

  const getCollectionTokensCount = useCallback(async (collectionId: string) => {
    if (!api || !collectionId) {
      return [];
    }

    try {
      return await api.query.nft.itemListIndex(collectionId);
    } catch (e) {
      console.log('getTokensOfCollection error', e);
    }

    return 0;
  }, [api]);

  const getCreatedCollectionCount = useCallback(async () => {
    try {
      return parseInt((await api.query.nft.createdCollectionCount()).toString(), 10);
    } catch (e) {
      console.log('getCreatedCollectionCount error', e);
    }

    return 0;
  }, [api]);

  const createCollection = useCallback((account: string, { description, modeprm, name, tokenPrefix }: { name: string, description: string, tokenPrefix: string, modeprm: { nft?: null, fungible?: null, refungible?: null, invalid?: null }}, callBacks?: TransactionCallBacks) => {
    const transaction = api.tx.nft.createCollection(strToUTF16(name), strToUTF16(description), strToUTF16(tokenPrefix), modeprm);

    queueExtrinsic({
      accountId: account && account.toString(),
      extrinsic: transaction,
      isUnsigned: false,
      txFailedCb: () => { callBacks?.onFailed && callBacks.onFailed(); console.log('create collection failed'); },
      txStartCb: () => { callBacks?.onStart && callBacks.onStart(); console.log('create collection start'); },
      txSuccessCb: () => { callBacks?.onSuccess && callBacks.onSuccess(); console.log('create collection success'); },
      txUpdateCb: () => { callBacks?.onUpdate && callBacks.onUpdate(); console.log('create collection update'); }
    });
  }, [api, queueExtrinsic]);

  const setCollectionSponsor = useCallback(({ account, collectionId, errorCallback, newSponsor, successCallback }: { account: string, collectionId: string, newSponsor: string, successCallback?: () => void, errorCallback?: () => void }) => {
    const transaction = api.tx.nft.setCollectionSponsor(collectionId, newSponsor);

    queueExtrinsic({
      accountId: account && account.toString(),
      extrinsic: transaction,
      isUnsigned: false,
      txFailedCb: () => { console.log('set collection sponsor fail'); errorCallback && errorCallback(); },
      txStartCb: () => { console.log('set collection sponsor start'); },
      txSuccessCb: () => { console.log('set collection sponsor success'); successCallback && successCallback(); },
      txUpdateCb: () => { console.log('set collection sponsor update'); }
    });
  }, [api, queueExtrinsic]);

  const removeCollectionSponsor = useCallback(({ account, collectionId, errorCallback, successCallback }: { account: string, collectionId: string, successCallback?: () => void, errorCallback?: () => void }) => {
    const transaction = api.tx.nft.removeCollectionSponsor(collectionId);

    queueExtrinsic({
      accountId: account && account.toString(),
      extrinsic: transaction,
      isUnsigned: false,
      txFailedCb: () => { console.log('remove collection sponsor fail'); errorCallback && errorCallback(); },
      txStartCb: () => { console.log('remove collection sponsor start'); },
      txSuccessCb: () => { console.log('remove collection sponsor success'); successCallback && successCallback(); },
      txUpdateCb: () => { console.log('remove collection sponsor update'); }
    });
  }, [api, queueExtrinsic]);

  const confirmSponsorship = useCallback(({ account, collectionId, errorCallback, successCallback }: { account: string, collectionId: string, successCallback?: () => void, errorCallback?: () => void }) => {
    const transaction = api.tx.nft.confirmSponsorship(collectionId);

    queueExtrinsic({
      accountId: account && account.toString(),
      extrinsic: transaction,
      isUnsigned: false,
      txFailedCb: () => { console.log('confirm sponsorship fail'); errorCallback && errorCallback(); },
      txStartCb: () => { console.log('confirm sponsorship start'); },
      txSuccessCb: () => { console.log('confirm sponsorship success'); successCallback && successCallback(); },
      txUpdateCb: () => { console.log('confirm sponsorship update'); }
    });
  }, [api, queueExtrinsic]);

  const getCollectionAdminList = useCallback(async (collectionId: string) => {
    if (!api || !collectionId) {
      return [];
    }

    try {
      return await api.query.nft.adminList(collectionId);
    } catch (e) {
      console.log('getCollectionAdminList error', e);
    }

    return [];
  }, [api]);

  const setSchemaVersion = useCallback(({ account, collectionId, errorCallback, schemaVersion, successCallback }: { account: string, schemaVersion: SchemaVersionTypes, collectionId: string, successCallback?: () => void, errorCallback?: () => void }) => {
    const transaction = api.tx.nft.setSchemaVersion(collectionId, schemaVersion);

    queueExtrinsic({
      accountId: account && account.toString(),
      extrinsic: transaction,
      isUnsigned: false,
      txFailedCb: () => { console.log('set schema version fail'); errorCallback && errorCallback(); },
      txStartCb: () => { console.log('set schema version  start'); },
      txSuccessCb: () => { console.log('set schema version  success'); successCallback && successCallback(); },
      txUpdateCb: () => { console.log('set schema version  update'); }
    });
  }, [api, queueExtrinsic]);

  const setOffChainSchema = useCallback(({ account, collectionId, errorCallback, schema, successCallback }: { account: string, schema: string, collectionId: string, successCallback?: () => void, errorCallback?: () => void }) => {
    const transaction = api.tx.nft.setOffchainSchema(collectionId, schema);

    console.log('schema!!!', schema);

    queueExtrinsic({
      accountId: account && account.toString(),
      extrinsic: transaction,
      isUnsigned: false,
      txFailedCb: () => { console.log('set offChain schema fail'); errorCallback && errorCallback(); },
      txStartCb: () => { console.log('set offChain schema start'); },
      txSuccessCb: () => { console.log('set offChain schema success'); successCallback && successCallback(); },
      txUpdateCb: () => { console.log('set offChain schema update'); }
    });
  }, [api, queueExtrinsic]);

  const addCollectionAdmin = useCallback(({ account, collectionId, errorCallback, newAdminAddress, successCallback }: { account: string, collectionId: string, newAdminAddress: string, successCallback?: () => void, errorCallback?: () => void }) => {
    const transaction = api.tx.nft.addCollectionAdmin(collectionId, newAdminAddress);

    queueExtrinsic({
      accountId: account && account.toString(),
      extrinsic: transaction,
      isUnsigned: false,
      txFailedCb: () => { console.log('add collection admin fail'); errorCallback && errorCallback(); },
      txStartCb: () => { console.log('add collection admin start'); },
      txSuccessCb: () => { console.log('add collection admin success'); successCallback && successCallback(); },
      txUpdateCb: () => { console.log('add collection admin update'); }
    });
  }, [api, queueExtrinsic]);

  const removeCollectionAdmin = useCallback(({ account, adminAddress, collectionId, errorCallback, successCallback }: { account: string, collectionId: string, adminAddress: string, successCallback?: () => void, errorCallback?: () => void }) => {
    const transaction = api.tx.nft.removeCollectionAdmin(collectionId, adminAddress);

    queueExtrinsic({
      accountId: account && account.toString(),
      extrinsic: transaction,
      isUnsigned: false,
      txFailedCb: () => { console.log('remove collection admin fail'); errorCallback && errorCallback(); },
      txStartCb: () => { console.log('remove collection admin start'); },
      txSuccessCb: () => { console.log('remove collection admin success'); successCallback && successCallback(); },
      txUpdateCb: () => { console.log('remove collection admin update'); }
    });
  }, [api, queueExtrinsic]);

  const saveConstOnChainSchema = useCallback(({ account, collectionId, errorCallback, schema, successCallback }: { account: string, collectionId: string, schema: string, successCallback?: () => void, errorCallback?: () => void }) => {
    const transaction = api.tx.nft.setConstOnChainSchema(collectionId, schema);

    queueExtrinsic({
      accountId: account && account.toString(),
      extrinsic: transaction,
      isUnsigned: false,
      txFailedCb: () => { console.log('set collection constOnChain fail'); errorCallback && errorCallback(); },
      txStartCb: () => { console.log('set collection constOnChain start'); },
      txSuccessCb: () => { console.log('set collection constOnChain success'); successCallback && successCallback(); },
      txUpdateCb: () => { console.log('set collection constOnChain update'); }
    });
  }, [api, queueExtrinsic]);

  const saveVariableOnChainSchema = useCallback(({ account, collectionId, errorCallback, schema, successCallback }: { account: string, collectionId: string, schema: string, successCallback?: () => void, errorCallback?: () => void }) => {
    const transaction = api.tx.nft.setVariableOnChainSchema(collectionId, schema);

    queueExtrinsic({
      accountId: account && account.toString(),
      extrinsic: transaction,
      isUnsigned: false,
      txFailedCb: () => { console.log('set collection varOnChain fail'); errorCallback && errorCallback(); },
      txStartCb: () => { console.log('set collection varOnChain start'); },
      txSuccessCb: () => { console.log('set collection varOnChain success'); successCallback && successCallback(); },
      txUpdateCb: () => { console.log('set collection varOnChain update'); }
    });
  }, [api, queueExtrinsic]);


  const getCollectionOnChainSchema = useCallback((collectionInfo: NftCollectionInterface): { constSchema: ProtobufAttributeType | undefined, variableSchema: ProtobufAttributeType | undefined } => {
    const result: {
      constSchema: ProtobufAttributeType | undefined,
      variableSchema: ProtobufAttributeType | undefined,
    } = {
      constSchema: undefined,
      variableSchema: undefined
    };

    try {
      const constSchema = hex2a(collectionInfo.ConstOnChainSchema);
      const varSchema = hex2a(collectionInfo.VariableOnChainSchema);

      if (constSchema && constSchema.length) {
        result.constSchema = JSON.parse(constSchema) as ProtobufAttributeType;
      }

      if (varSchema && varSchema.length) {
        result.variableSchema = JSON.parse(varSchema) as ProtobufAttributeType;
      }

      return result;
    } catch (e) {
      console.log('getCollectionOnChainSchema error');
    }

    return result;
  }, [hex2a]);


  useEffect(() => {
    return () => {
      cleanup.current = true;
    };
  }, []);

  return {
    fullFillOrder, 
    getOrder,
    getAssets,
    getCollections,
    // getCollectionWithTokenCount,
    // getDetailedCollectionInfo,
    getHoldByMe,
    getOffers,
    // getTokensOfCollection,
    // getTrades,
    // holdLoading,
    mintOnUniq,
    myHold,
    // myTrades,
    offers,
    // offersCount,
    // offersLoading,
    presetCollections
    // presetTokensCollections,
    // trades,
    // tradesLoading, 
    // addCollectionAdmin,
    // confirmSponsorship,
    // createCollection,
    // error,
    // getCollectionAdminList,
    // getCollectionOnChainSchema,
    // getCollectionTokensCount,
    // getCreatedCollectionCount,
    // getDetailedCollectionInfo,
    // getTokensOfCollection,
    // removeCollectionAdmin,
    // removeCollectionSponsor,
    // saveConstOnChainSchema,
    // saveVariableOnChainSchema,
    // setCollectionSponsor,
    // setOffChainSchema,
    // setSchemaVersion 
  };
}
