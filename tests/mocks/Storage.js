const setMock = jest.fn();
const getMock = jest.fn(() => null);
const deleteMock = jest.fn();
const deleteAllMock = jest.fn(() => ({}));

const StorageMock = {
    set: setMock,
    get: getMock,
    delete: deleteMock,
    deleteAll: deleteAllMock,

    reset: () => {
        setMock.mockClear();
        getMock.mockClear();
        deleteMock.mockClear();
        deleteAllMock.mockClear();
    },
};

module.exports = StorageMock;
