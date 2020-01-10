import React, {Component} from 'react';
import { Panel, PanelHeader, IS_PLATFORM_IOS, Div, HeaderButton } from '@vkontakte/vkui';

import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import Icon24Back from '@vkontakte/icons/dist/24/back';
import '@vkontakte/vkui/dist/vkui.css';
import './Home.css';

class Rules extends Component {


    render() {
        const { id, onStoryChange } = this.props;

        return (
            <Panel id={id}>
                <PanelHeader left={
                  <HeaderButton onClick={ () => onStoryChange('home', 'addMeetPage') }>
			               {IS_PLATFORM_IOS ? <Icon28ChevronBack/> : <Icon24Back/>}
		               </HeaderButton>}>
                   Соглашение</PanelHeader>

                <Div>*соглашение*</Div>
            </Panel>
        );
    }
}

export default Rules;
