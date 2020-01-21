import React, {Component} from 'react';
import { Group, Placeholder } from '@vkontakte/vkui';

import MeetBox from './MeetBox';

import Icon56RecentOutline from '@vkontakte/icons/dist/56/recent_outline';

class MeetList extends Component {

    render() {
        const { meets, setParentState, getUserMeets, makeStory } = this.props;

        if(meets === false){
          return null
        }

        return (
            <>
                {
                    (meets && meets.length) ?
                        <Group className="transparentBody MeetList">
                            {
                                meets.map((meet, index) =>
                                (
                                  <MeetBox
                                      key={index}
                                      meet={meet}
                                      {...this.props}
                                      makeStory={makeStory}
                                      getUserMeets={getUserMeets}
                                      setParentState={setParentState}
                                  />
                                ))
                            }
                      </Group>
                        :

                        <Placeholder
                          stretched
                          icon={<Icon56RecentOutline />}
                          >
                        Скоро здесь обязательно что-то появится..
                          </Placeholder>

                }
                </>
        )
    }
}

export default MeetList;
