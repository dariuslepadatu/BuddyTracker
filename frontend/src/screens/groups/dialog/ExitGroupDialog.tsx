import * as React from 'react';
import {Dialog, Portal, Text, TextInput} from 'react-native-paper';
import { Button } from 'react-native';
import {deleteMemberFromGroup, inviteToGroup} from "../../../helpers/backend_helper.ts";
import Toast from "react-native-toast-message";

const ExitGroupDialog = ({hide, group, handleExitGroup}) => {
    const [error, setError] = React.useState('');
    const [showError, setShowError] = React.useState(false);
    const handleSubmit = () => {
        deleteMemberFromGroup({group_id: group})
            .then(() => {
                handleExitGroup();
                hide();
            })
            .catch((error) => {
                setShowError(true);
                setError(error);
            })
    }
    return (
        <Portal>
            <Dialog visible onDismiss={hide}>
                <Dialog.Title>Are you sure you want exit this group?</Dialog.Title>
                <Dialog.Content>
                    {showError && (
                        <Text style={{
                            color: 'red',
                        }}>{error}</Text>
                    )}

                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={() => hide()} title="Cancel" color='#000000' />
                    <Button onPress={() => handleSubmit()} color="red" title="Exit"/>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

export default ExitGroupDialog;