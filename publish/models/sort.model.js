export class Sort {
    constructor(column = "createdAt", direction = "DESC") {
        this.direction = direction;
        this.column = column;
    }
    getSortDirection() {
        return this.direction.split(",");
    }
    getSortColumn() {
        return this.column.split(",");
    }
    asKeyValue() {
        const direction = this.getSortDirection();
        const sort = this.getSortColumn();
        const result = {};
        for (let i = 0; i < sort.length; i++) {
            const key = sort[i];
            const value = direction[i];
            if (key.includes(".")) {
                const [parent, child] = key.split(".");
                if (!result[parent]) {
                    result[parent] = {};
                }
                result[parent][child] = value;
            }
            else {
                result[key] = value;
            }
        }
        return result;
    }
    static from(column, direction) {
        return new Sort(column, direction);
    }
}
