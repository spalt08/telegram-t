import React, { FC, memo } from '../../../lib/teact/teact';

import Button from '../../ui/Button';

type OwnProps = {
  activeTab: SymbolMenuTabs;
  onSwitchTab: (tab: SymbolMenuTabs) => void;
  onRemoveSymbol: () => void;
};

export enum SymbolMenuTabs {
  'Emoji',
  'Stickers',
  'GIFs',
}

// Getting enum string values for display in Tabs.
// See: https://www.typescriptlang.org/docs/handbook/enums.html#reverse-mappings
export const SYMBOL_MENU_TAB_TITLES = Object.values(SymbolMenuTabs)
  .filter((value): value is string => typeof value === 'string');

const SYMBOL_MENU_TAB_ICONS = {
  [SymbolMenuTabs.Emoji]: 'icon-smile',
  [SymbolMenuTabs.Stickers]: 'icon-stickers',
  [SymbolMenuTabs.GIFs]: 'icon-gifs',
};

const SymbolMenuFooter: FC<OwnProps> = ({
  activeTab, onSwitchTab, onRemoveSymbol,
}) => {
  function renderTabButton(tab: SymbolMenuTabs) {
    return (
      <Button
        className={`symbol-tab-button ${activeTab === tab ? 'activated' : ''}`}
        onClick={() => onSwitchTab(tab)}
        ariaLabel={SYMBOL_MENU_TAB_TITLES[tab]}
        round
        color="translucent"
      >
        <i className={SYMBOL_MENU_TAB_ICONS[tab]} />
      </Button>
    );
  }

  return (
    <div className="SymbolMenu-footer">
      {activeTab !== SymbolMenuTabs.Emoji && (
        <Button
          className="symbol-search-button not-implemented"
          ariaLabel={activeTab === SymbolMenuTabs.Stickers ? 'Search Stickers' : 'Search GIFs'}
          round
          color="translucent"
        >
          <i className="icon-search" />
        </Button>
      )}

      {renderTabButton(SymbolMenuTabs.Emoji)}
      {renderTabButton(SymbolMenuTabs.Stickers)}
      {renderTabButton(SymbolMenuTabs.GIFs)}

      {activeTab === SymbolMenuTabs.Emoji && (
        <Button
          className="symbol-delete-button"
          onClick={onRemoveSymbol}
          ariaLabel="Remove Symbol"
          round
          color="translucent"
        >
          <i className="icon-delete-left" />
        </Button>
      )}
    </div>
  );
};

export default memo(SymbolMenuFooter);
