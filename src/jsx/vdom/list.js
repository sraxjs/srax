import VUtils from './utils';

const MakeKeyIndexAndFree = (list) => {

    let keyIndex = {};
    let free = [];

    let item;
    let itemKey;

    for (let i = 0, len = list.length; i < len; i++) {
        item = list[i];
        itemKey = VUtils.getItemSign(item);
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

export const DiffList = (newList, oldList) => {

    let newMap = MakeKeyIndexAndFree(newList);
    let oldMap = MakeKeyIndexAndFree(oldList);

    let newFree = newMap.free;

    let oldKeyIndex = oldMap.keyIndex;
    let newKeyIndex = newMap.keyIndex;

    let moves = [];

    let children = [];

    let item;
    let itemKey;
    let freeIndex = 0;
    let simulateListItem;
    let newItemIndex;
    let freeItem;

    let simulateList = [];
    let j = 0;
    let nextItemKey;

    let simulateItem;
    let simulateItemKey;

    let remove = function (index, item) {
        moves.push({ index: index, item: item, type: VUtils.REMOVE });
    };

    let insert = function (index, item) {
        moves.push({ index: index, item: item, type: VUtils.INSERT });
    };

    let removeSimulate = function (index) {
        simulateList.splice(index, 1);
    };

    for (let i = 0, len = oldList.length; i < len; i++) {

        item = oldList[i];
        itemKey = VUtils.getItemSign(item);

        if (itemKey) {
            if (!newKeyIndex.hasOwnProperty(itemKey)) {
                children.push(null);
                simulateList.push(null);
            } else {
                newItemIndex = newKeyIndex[itemKey];
                children.push(newList[newItemIndex]);
                simulateList.push(newList[newItemIndex]);
            }
        } else {
            freeItem = newFree[freeIndex++];
            children.push(freeItem || null);
            simulateList.push(freeItem || null);
        }

    }

    for (let i = 0, len = simulateList.length; i < len; i++) {
        simulateListItem = simulateList[i];
        if (simulateListItem === null || simulateListItem === undefined) {
            remove(i);
            removeSimulate(i);
            i--;
            len = simulateList.length;
        }
    }

    for (let i = 0, len = newList.length; i < len; i++) {

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

    }

    return {
        moves: moves,
        children: children
    };

};