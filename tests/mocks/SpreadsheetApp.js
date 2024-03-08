const okButton = "OK";
const cancelButton = "CANCEL";
const okCancelButtonSet = "OK_CANCEL";

const uiPromptMock = jest.fn(() => ({ getSelectedButton: () => cancelButton }));

const SpreadsheetAppMock = {
    getUi: () => ({
        prompt: uiPromptMock,
        ButtonSet: { OK_CANCEL: okCancelButtonSet },
        Button: { OK: okButton, CANCEL: cancelButton },
    }),
};

module.exports = {
    mock: SpreadsheetAppMock,
    uiPromptMock,
    okButton,
    cancelButton,
    okCancelButtonSet,
    reset: function () {
        this.uiPromptMock.mockClear();
    },
}