import * as React from 'react';
import { Dialog, Portal } from 'react-native-paper';
import { Button } from 'react-native';

const LogoutDialog = ({hide, handleLogout}) => {
    const handleSubmit = () => {
        hide();
        handleLogout();
    }
    return (
        <Portal>
            <Dialog visible onDismiss={hide}>
                <Dialog.Title>Are you sure you want to logout?</Dialog.Title>
                <Dialog.Actions>
                    <Button onPress={() => hide()} title="Cancel" color='#000000' />
                    <Button onPress={() => handleSubmit()} color="#FF0000" title="Logout"/>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

export default LogoutDialog;