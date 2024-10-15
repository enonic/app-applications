/**
 * Created on 02.12.2017.
 */
module.exports = Object.freeze({
    NOTIFICATION_TEXT: "//div[@class='notification-text']",
    FORM_VIEW: "//div[contains(@id,'FormView')]",
    CONTENT_SELECTOR: "//div[contains(@id,'ContentSelector')]",
    NAMES_VIEW_BY_NAME: "//div[contains(@id,'NamesView') and child::p[contains(@class,'sub-name') and contains(.,'%s')]]",
    NAMES_VIEW_BY_DISPLAY_NAME: "//div[contains(@id,'NamesView') and child::h6[contains(@class,'main-name') and contains(.,'%s')]]",
    H6_DISPLAY_NAME: "//div[contains(@id,'NamesView')]//h6[contains(@class,'main-name')]",
    TEXT_INPUT: "//input[contains(@id,'TextInput')]",
    DROP_DOWN_HANDLE: "//button[contains(@id,'DropdownHandle')]",
    MARKET_MODAL_DIALOG: {
        rowByDisplayName(displayName) {
            return `//li[contains(@id,'MarketListViewer') and (descendant::h6[contains(@class,'main-name') and contains(.,'${displayName}')])]`;
        },
    },
    TREE_GRID: {
        rowByDisplayName(displayName) {
            return `//li[contains(@class,'item-view-wrapper') and (descendant::h6[contains(@class,'main-name') and contains(.,'${displayName}')])]`;
        },
    },

    itemByDisplayName(displayName) {
        return `//div[contains(@id,'NamesView') and child::h6[contains(@class,'main-name') and contains(.,'${displayName}')]]`
    },
    appByDescription(description) {
        return `//div[contains(@id,'NamesView') and child::p[contains(@class,'sub-name') and contains(.,'${description}')]]`
    },
    tabItemByDisplayName(displayName) {
        return `//li[contains(@id,'AppBarTabMenuItem') and descendant::a[contains(.,'${displayName}')]]`
    },
    CANCEL_BUTTON_TOP: "//div[@class='cancel-button-top']",

    COMBO_BOX_OPTION_FILTER_INPUT: "//input[contains(@id,'ComboBoxOptionFilterInput')]",

    PRINCIPAL_SELECTED_OPTION: `//div[contains(@id,'security.PrincipalSelectedOptionView')]`,

    selectedPrincipalByDisplayName(displayName) {
        return `//div[contains(@id,'PrincipalSelectedOptionView') and descendant::h6[contains(@class,'main-name') and text()='${displayName}']]`
    },
    REMOVE_ICON: "//a[@class='remove']",
    DIV: {
        CHECKBOX_DIV: "//div[contains(@id,'Checkbox')]",
        DROPDOWN_DIV: "//div[contains(@id,'Dropdown')]",
        NOTIFICATION_ACTIONS_DIV: "//div[@class='notification-actions']",
    },
});
