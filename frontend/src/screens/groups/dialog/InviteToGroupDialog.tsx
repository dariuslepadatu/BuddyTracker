import * as React from 'react';
import {Dialog, Portal, Text, TextInput} from 'react-native-paper';
import { Button } from 'react-native';
import {inviteToGroup} from "../../../helpers/backend_helper.ts";
import Toast from "react-native-toast-message";

const InviteToGroupDialog = ({hide, group, handleInviteToGroup}) => {
    const [userToInvite, setUserToInvite] = React.useState('');
    const [error, setError] = React.useState('');
    const [showError, setShowError] = React.useState(false);
    const handleSubmit = () => {
        inviteToGroup({group_id: group, invited_user_id: userToInvite})
            .then(() => {
                handleInviteToGroup(userToInvite);
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
                <Dialog.Title>Please write the name of the user</Dialog.Title>
                <Dialog.Content>
                    <TextInput value={userToInvite} onChangeText={setUserToInvite} />
                    {showError && (
                        <Text style={{
                            color: 'red',
                        }}>{error}</Text>
                    )}

                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={() => hide()} title="Cancel" color='#000000' />
                    <Button onPress={() => handleSubmit()} color="green" title="Invite"/>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

export default InviteToGroupDialog;