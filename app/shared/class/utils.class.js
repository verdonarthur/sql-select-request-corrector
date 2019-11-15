module.exports = class {

    /**
     * src : https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
     * @param {*} array 
     * @param {*} callback 
     */
    static async asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    }
}