import * as React from 'react';
import {Dialog, Portal, Text, TextInput} from 'react-native-paper';
import { Button } from 'react-native';
import {createGroup} from "../../../helpers/backend_helper.ts";
import Toast from "react-native-toast-message";

const CreateGroupDialog = ({hide, handleCreateGroup}) => {
    const [groupName, setGroupName] = React.useState('');
    const [error, setError] = React.useState('');
    const [showError, setShowError] = React.useState(false);
    const handleSubmit = () => {
        createGroup({group_id: groupName})
            .then(() => {
                handleCreateGroup(groupName);
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
                <Dialog.Title>Please write the name of the new group</Dialog.Title>
                <Dialog.Content>
                    <TextInput value={groupName} onChangeText={setGroupName} />
                    {showError && (
                        <Text style={{
                            color: 'red',
                        }}>{error}</Text>
                    )}


                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={() => hide()} title="Cancel" color='#000000' />
                    <Button onPress={() => handleSubmit()} color="green" title="Create group"/>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

export default CreateGroupDialog;