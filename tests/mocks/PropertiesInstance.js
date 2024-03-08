const setPropertyMock = jest.fn();
const getPropertyMock = jest.fn(() => null);
const deletePropertyMock = jest.fn();
const getPropertiesMock = jest.fn(() => ({}));

const PropertiesInstanceMock = {
    setProperty: setPropertyMock,
    getProperty: getPropertyMock,
    deleteProperty: deletePropertyMock,
    getProperties: getPropertiesMock,

    reset: () => {
        setPropertyMock.mockClear();
        getPropertyMock.mockClear();
        deletePropertyMock.mockClear();
        getPropertiesMock.mockClear();
    },
};

module.exports = PropertiesInstanceMock;
