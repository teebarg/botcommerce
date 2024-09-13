"use client";

import React from "react";
import { Kbd } from "@nextui-org/kbd";
import { Modal, ModalContent, ModalBody, useDisclosure } from "@nextui-org/react";
import { MagnifyingGlassMini } from "nui-react-icons";
import { SEARCH_INDEX_NAME, searchClient } from "@lib/search-client";
import Hit from "@modules/search/components/hit";
import Hits from "@modules/search/components/hits";
import { InstantSearch } from "react-instantsearch-hooks-web";
import SearchInput from "@modules/search/components/search-input";
import Button from "@modules/common/components/button";

export default function Search() {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <React.Fragment>
            <Button color="default" endContent={<Kbd keys={["command"]}>K</Kbd>} startContent={<MagnifyingGlassMini />} onClick={() => onOpen()}>
                Search products, brands and categories...
            </Button>
            <Modal hideCloseButton backdrop="blur" className="!m-0" isOpen={isOpen} size="4xl" onClose={onClose}>
                <ModalContent className="fz1">
                    {(onClose) => (
                        <>
                            <ModalBody className="!p-0 gap-0">
                                <InstantSearch indexName={SEARCH_INDEX_NAME} searchClient={searchClient}>
                                    <div className="flex items-center w-full px-4 border-b border-default-400/50 dark:border-default-100">
                                        <MagnifyingGlassMini />
                                        <SearchInput />
                                        <Kbd className="hidden md:block border-none px-2 py-1 ml-2 font-medium text-[0.6rem]">ESC</Kbd>
                                    </div>
                                    <div className="max-h-[70vh] min-h-[70vh] overflow-y-auto">
                                        <Hits hitComponent={Hit} />
                                    </div>
                                </InstantSearch>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </React.Fragment>
    );
}
