// Copyright 2017-2021 @polkadot/apps, UseTech authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable */
import './styles.scss';

import type { NftCollectionInterface } from '@polkadot/react-hooks/useCollection';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router';
import Item from 'semantic-ui-react/dist/commonjs/views/Item';

import envConfig from '@polkadot/apps-config/envConfig';
import pencil from '@polkadot/react-components/ManageCollection/pencil.svg';
import transfer from '@polkadot/react-components/ManageCollection/transfer.svg';
import Tooltip from '@polkadot/react-components/Tooltip';
import Button from '@polkadot/react-components/Button/Button';
import { useSchema } from '@polkadot/react-hooks';
import { HoldType } from '@polkadot/react-hooks/useCollectionsOpenSea';
import { getOrderHash } from 'opensea-js/utils/utils';

const { canEditToken } = envConfig;

interface Props {
  account: string;
  canTransferTokens: boolean;
  collection: NftCollectionInterface;
  onHold: HoldType[];
  openTransferModal: (collection: NftCollectionInterface, tokenId: string, balance: number) => void;
  token: string;
  tokensSelling: string[];
  fullFillOrder;
  getOrder;
  mintOnUniq;
}

function NftTokenCard ({ account, canTransferTokens, collection, onHold, openTransferModal, token, tokensSelling, fullFillOrder, getOrder, mintOnUniq }: Props): React.ReactElement<Props> {
  const { attributes, reFungibleBalance, tokenUrl } = useSchema(account, collection.id, token);
  const [tokenState, setTokenState] = useState<'none' | 'selling' | 'onHold'>('none');
  const [tokentoBuy, setTokentoBuy] = useState();
  const history = useHistory();

  const openDetailedInformationModal = useCallback((collectionId: string | number, tokenId: string) => {
    history.push(`/myStuff/token-details?collectionId=${collectionId}&tokenId=${tokenId}`);
  }, [history]);

  const editToken = useCallback((collectionId: string, tokenId: string) => {
    history.push(`/myStuff/manage-token?collectionId=${collectionId}&tokenId=${tokenId}`);
  }, [history]);

  const attrebutesToShow = useMemo(() => {
    if (attributes) {
      return [...Object.keys(attributes).map((attr: string) => {
        if (attr.toLowerCase().includes('hash')) {
          return `${attr}: ${(attributes[attr] as string).substring(0, 8)}...`;
        }

        if (Array.isArray(attributes[attr])) {
          return `${attr}: ${((attributes[attr] as string[]).join(', '))}`;
        }

        return `${attr}: ${(attributes[attr] as string)}`;
      })].join(', ');
    }

    return '';
  }, [attributes]);
  // TODO - return functionality
  const updateTokenState = useCallback(() => { 
/*     let tState: 'none' | 'selling' | 'onHold' = 'none';

    if (tokensSelling.indexOf(token) !== -1) {
      tState = 'selling';
    } else if (onHold.find((item) => item.tokenId === token)) {
      tState = 'onHold';
    }

    setTokenState(tState); */
  }, [onHold, token, tokensSelling]);

  useEffect(() => {
    updateTokenState();
  }, [updateTokenState]);

  if (!reFungibleBalance && collection?.Mode?.reFungible) {
    return <></>;
  }
  const handleBuy = () => {
    // history.push(ROUTES.buyOpenSeaToken);
//    if (token.sellOrders?.length > 0)
    {  
      getOrder(token.tokenAddress, token.tokenId)  
      fullFillOrder(token.sellOrders[token.sellOrders?.length-1])
    }  };
    const handleMint = () => {
      // history.push(ROUTES.buyOpenSeaToken);
  //    if (token.sellOrders?.length > 0)
      {  
        mintOnUniq(token.tokenAddress, token.tokenId)  
      }  };
  return (
    <div
      className='token-row'
      key={token}
    >
      <div
        className='token-image'
        onClick={openDetailedInformationModal.bind(null, token.tokenAddress, token.tokenId)}
      >
        { token.imagePreviewUrl && (
          <Item.Image
            size='mini'
            src={token.imagePreviewUrl}
          />
        )}
      </div>
      <div
        className='token-info-attributes'
        onClick={openDetailedInformationModal.bind(null, token.tokenAddress, token.tokenId)}
      >
        <div className='token-name'>
          #{token.name} 
          {token.sellOrders?.length > 0 && (
            <>
            <br /> Sell orders: {token.sellOrders?.length}
            <br /> Current price: {token.sellOrders[token.sellOrders?.length -1]?.currentPrice}
            </>
          )}
        </div>
        <div className='token-balance'>
          { /* collection && Object.prototype.hasOwnProperty.call(collection.Mode, 'reFungible') &&  <span>Balance: reFungibleBalance</span> */ }
        </div>
        <div className='token-attributes'>
         
            <span>
              <strong>Description: </strong>{token.description}
            </span>
        
        </div>
      </div>
      <div className='token-actions'>
        { canEditToken && tokenState === 'none' && (
          <>
            <img
              alt={'add'}
              data-for='Edit nft'
              data-tip='Edit nft'
              onClick={editToken.bind(null, collection.id, token)}
              src={pencil as string}
              title='add'
            />
            <Tooltip
              arrowColor={'transparent'}
              backgroundColor={'var(--border-color)'}
              place='bottom'
              text={'Edit nft'}
              textColor={'var(--sub-header-text-transform)'}
              trigger={'Edit nft'}
            />
          </>
        )}
        { canTransferTokens && tokenState === 'none' && (
          <>
            <img
              alt={'add'}
              data-for='Transfer nft'
              data-tip='Transfer nft'
              onClick={openTransferModal.bind(null, collection, token, reFungibleBalance)}
              src={transfer as string}
              title='add'
            />
            <Tooltip
              arrowColor={'transparent'}
              backgroundColor={'var(--border-color)'}
              place='bottom'
              text={'Transfer nft'}
              textColor={'var(--sub-header-text-transform)'}
              trigger={'Transfer nft'}
            />
          </>
        )}
        { tokenState === 'selling' && (
          <span className='token-state'>
            Selling
          </span>
        )}
        { tokenState === 'onHold' && (
          <span className='token-state'>
            On hold
          </span>
        )}
{/*         <Button onClick={handleBuy}>
          Buy and transfer to Uniq
        </Button> */}
        <Button onClick={handleMint}>
         Mint on Uniq
        </Button>

                      <a href = {token.openseaLink} target='_blank' >openseaLink</a>

      </div>
    </div>
  );
}

export default React.memo(NftTokenCard);
