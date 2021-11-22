import Patch from './patch';
import VUtils from './utils';

let MakeKeyIndexAndFree = (list) => {

    let keyIndex = {};
    let free = [];

    for (let i = 0, len = list.length; i < len; i++) {
        let item = list[i];
        let itemKey = VUtils.getItemSign(item);
        if (itemKey) {
            keyIndex[itemKey] = i;
        } else {
            free.push(item);
        }
    }

    return {
        keyIndex: keyIndex,
        free: free
    };

};

let DiffList = (newList, oldList) => {

    let newMap = MakeKeyIndexAndFree(newList);
    let oldMap = MakeKeyIndexAndFree(oldList);

    let newFree = newMap.free;

    let oldKeyIndex = oldMap.keyIndex;
    let newKeyIndex = newMap.keyIndex;

    let moves = [];

    let children = [];
    let i = 0;

    let item;
    let itemKey;
    let freeIndex = 0;
    let simulateListItem;
    let newItemIndex;
    let freeItem;

    let simulateList;
    let j;
    let nextItemKey;

    let simulateItem;
    let simulateItemKey;

    let remove = function (index, item) {
        moves.push({ index: index, item: item, type: Patch.REMOVE });
    };

    let insert = function (index, item) {
        moves.push({ index: index, item: item, type: Patch.INSERT });
    };

    let removeSimulate = function (index) {
        simulateList.splice(index, 1);
    };

    while (i < oldList.length) {

        item = oldList[i];
        itemKey = VUtils.getItemSign(item);

        if (itemKey) {
            if (!newKeyIndex.hasOwnProperty(itemKey)) {
                children.push(null);
            } else {
                newItemIndex = newKeyIndex[itemKey];
                children.push(newList[newItemIndex]);
            }
        } else {
            freeItem = newFree[freeIndex++];
            children.push(freeItem || null);
        }

        i++;

    }

    simulateList = children.slice(0);

    i = 0;

    while (i < simulateList.length) {
        simulateListItem = simulateList[i];
        if (simulateListItem === null) {
            remove(i);
            removeSimulate(i);
        } else {
            i++;
        }
    }

    j = i = 0;

    while (i < newList.length) {

        item = newList[i];
        itemKey = VUtils.getItemSign(item);

        simulateItem = simulateList[j];
        simulateItemKey = VUtils.getItemSign(simulateItem);

        if (simulateItem) {
            if (itemKey === simulateItemKey) {
                j++;
            } else if (!oldKeyIndex.hasOwnProperty(itemKey)) {
                insert(i, item);
            } else {
                nextItemKey = VUtils.getItemSign(simulateList[j + 1]);
                if (nextItemKey === itemKey) {
                    remove(i, item);
                    removeSimulate(j);
                    j++;
                } else {
                    insert(i, item);
                }
            }
        } else {
            insert(i, item);
        }

        i++;

    }

    return {
        moves: moves,
        children: children
    };

};

export {
    DiffList
}