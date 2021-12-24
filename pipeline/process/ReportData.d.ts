/*
This is the interface generated after preprocessing

It needs to be trivally serializable because it will be stored in the report file
*/

import { Address, Platform, ReportConfig } from "@pipeline/Types";

type ID = number;
type DateStr = string; // YYYY-MM-DD

export interface ReportData {
    config: ReportConfig;
    title: string;
    time: {
        minDate: DateStr;
        maxDate: DateStr;
        numDays: number;
        numMonths: number;
    };

    channels: Channel[];
    authors: Author[];
    authorsOrder: ID[];
    authorsBotCutoff: number;
}

export type SerializedData = Uint8Array;

export interface Channel {
    name: string;
    name_searchable: string;
    messagesAddr: Address;
    messagesCount: number;
}

export interface Author {
    name: string;
    name_searchable: string;
    bot: boolean;
}
