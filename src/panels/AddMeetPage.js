import React, { Component } from 'react';
import { Panel, PanelHeader, FormLayout, UsersStack, Textarea, Input, Link,
  Spinner, Div, Group, Separator, Radio, File, Checkbox, Button } from '@vkontakte/vkui';

import connect from '@vkontakte/vk-connect';

//import Cropper from 'react-cropper';
//import 'cropperjs/dist/cropper.css';

import '@vkontakte/vkui/dist/vkui.css';
import './Home.css';
import { getMessage, dd } from '../js/helpers';

class AddMeetPage extends Component {
  constructor(props) {
      super(props);

      this.state = {
          disabled: false,
          token: false,
          error: false,
          message: false
      }

      this.onChange = this.onChange.bind(this);
      this.AddMeet = this.AddMeet.bind(this);
  }

  componentDidMount() {
      const { edit } = this.props;

      if (edit) {
          this.setState({ ...edit });
      }
  }


  AddMeet = async () => {
      const { api, setParentState, openDoneSnackbar, openErrorSnackbar, state } = this.props;

      setParentState({ disabled: true });
      const start = `${state.start_date} ${state.start_time}`;
      const finish = `${state.finish_date} ${state.finish_time}`;
      const { success, failed } = await api.AddMeet({
          isGroup: state.groupSelected,
          name: state.name,
          start: start,
          finish: finish,
          description: state.description,
          photo: state.photo
      });

      if (success) {
          const mes = `Ваша петиция <<${state.name}>> отправлена на модерацию.`;
        if(state.noty){
          fetch('https://cors-anywhere.herokuapp.com/https://groovy-apricot.glitch.me/', { method: 'GET' })
          .then(res => connect.send("VKWebAppSendPayload", {"group_id": 189366357, "payload": {"mes": mes}}));
        }

          setParentState({
                      activePanel: 'meets',
                      activeStory: 'home',
                      symbols_name: '',
                			symbols_description: '',
                			name: '',
                      description: '',
                			start_date: false,
                			finish_date: false,
                			photo: false,
                  	  accept: false
                    });
                  openDoneSnackbar(success);
      } else if(failed){
            openErrorSnackbar(failed)
      } else {
            openErrorSnackbar('Создавать петиции можно не чаще четырёх раз в день')
      }
      setTimeout(() => setParentState({
        popout: null
      }), 3000)  // понял, что всё таки нужно
  }
  onChange = (e) => {
    connect.unsubscribe(this.sub);
    connect.subscribe(this.sub);
    const { name, value } = e.currentTarget;
    if(name === 'file'){
      connect.send("VKWebAppGetAuthToken", {"app_id": 7217332, "scope": "photos"})
    } else {
      this.props.setParentState({ [name]: value });
      if(name === 'name') this.props.setParentState({ symbols_name: `${value.length}/60` })
      if(name === 'description') this.props.setParentState({ symbols_description: `${value.length}/254` })
    }
  }


  sub = (e) => {
    switch (e.detail.type) {
      case 'VKWebAppAccessTokenReceived':
      console.log(e.detail.type , e.detail.data)
      if(e.detail.data.scope === 'photos'){
        this.setState({ token: e.detail.data.access_token })
        connect.send("VKWebAppCallAPIMethod", {"method": "photos.getUploadServer", "request_id": "photo_req", "params":
         {"album_id": "267690301",  "group_id": "189366357", "v":"5.103", "access_token": e.detail.data.access_token }});
      }
        break;
      case 'VKWebAppCallAPIMethodResult':
         if(e.detail.data.request_id === 'photo_req'){
           this.uploadPhoto(e.detail.data.response.upload_url);
         }
         if(e.detail.data.request_id === 'photo_save_req'){
           connect.unsubscribe(this.sub);
           this.setState({
             error: false,
             message: 'Обложка загружена.',
             disabled: false
           })

           this.props.setParentState({ photo: e.detail.data.response[0].sizes[e.detail.data.response[0].sizes.length - 1].url });
           dd('photo', e.detail.data.response[0].sizes.length - 1 , e.detail.data.response[0].sizes[e.detail.data.response[0].sizes.length - 1].url);
         }
         dd('VKWebAppCallAPIMethodResult', e.detail.data);

        break;
      case 'VKWebAppCallAPIMethodFailed':
          console.log('VKWebAppCallAPIMethodFailed', e.detail.data);
        break;
      default:
        // code
    }
  }

  uploadPhoto = async (upload_url) => {
    const requestUrl = `https://vargasoff.ru/meet.php`;
    const file = document.getElementById('file').files[0];
//    this.setState({ loading: true })
    if(!file) {
      this.setState({ error: true })
      this.setState({ message: 'Файл не был выбран' })
      connect.unsubscribe(this.sub);
      return
    }
    if(!(file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg')){
      this.setState({ error: true })
      this.setState({ message: 'Формат выбранного файла не поддерживается.' })
      connect.unsubscribe(this.sub);
      return
    }
    console.log(file.size)
    if(file.size > 1190000){
      this.setState({ error: true })
      this.setState({ message: 'Размер выбранного файла слишком большой.' })
      connect.unsubscribe(this.sub);
      return
    }

    dd('file', file)
    const body = new FormData();
    body.append('file', file);
    body.append('url', upload_url);
    this.setState({ disabled: true });
    fetch(requestUrl, { method: 'POST', body }).then(res => res.json()).then(res => {

     connect.send("VKWebAppCallAPIMethod", { "method": "photos.save", "request_id": "photo_save_req",
      "params":
      {
        "album_id": "267690301",
        "group_id": "189366357",
        "server": res.info.server,
        "photos_list": res.info.photos_list,
        "hash": res.info.hash,
        "access_token": this.state.token,
        "v":"5.103"
      }
    });

   });
  }
    render() {
        const onChange = this.onChange;
        const { id, state, openErrorSnackbar, setParentState } = this.props;
        const { name, start, snackbar, start_date, finish_date,
          finish, description, symbols_name, symbols_description, photo, accept } = state;
        const formLang = getMessage('forms');

        const backgroundImage = `url(${photo || 'https://sun9-17.userapi.com/c856016/v856016841/191507/A_xwv3xLXfg.jpg'})`;
    //    const cropper = React.createRef(null);

      /*  function dataURLtoFile(dataurl, filename) {

          var arr = dataurl.split(','),
              mime = arr[0].match(/:(.*?);/)[1],
              bstr = atob(arr[1]),
              n = bstr.length,
              u8arr = new Uint8Array(n);

          while(n--){
              u8arr[n] = bstr.charCodeAt(n);
          }

          return new File([u8arr], filename, {type:mime});
      }

      //Usage example:
      var file = dataURLtoFile('data:text/plain;base64,aGVsbG8gd29ybGQ=','hello.txt');
      console.log(file);*/

        return (
            <Panel id={id}>
          {/*  <Cropper
                ref={cropper}
                src='https://sun9-17.userapi.com/c856016/v856016841/191507/A_xwv3xLXfg.jpg'
                style={{height: 400, width: '100%'}}
                aspectRatio={16 / 9}
                guides={true}
                crop={(e)=>console.log(e.target.cropper.getCroppedCanvas().toDataURL())}
              />
              */}
                <PanelHeader>{ getMessage('add_meet_page') }</PanelHeader>
                <Group title='Предпросмотр'/>
                <Div onClick={() => connect.send("VKWebAppShowImages", { images: [ photo ] })} className="MeetImg" style={{ backgroundImage }} >
                    <Div style={{ marginTop: '20%' }} className="MeetName">{ name || 'Сырки дорогие!' }</Div>
                    <Div style={{ marginTop: '20%' }} className="MeetName">{ start_date }</Div>
                </Div>
               <Group>

                 <Separator style={{ margin: '12px 0' }} />

                     <UsersStack  photos={[ state.groupSelected ? state.currentGroupInfo.photo : state.fetchedUser.photo_100 ]}>
                     { state.groupSelected ? state.currentGroupInfo.name
                   : `${state.fetchedUser.first_name} ${state.fetchedUser.last_name}` } • участников нет
                     </UsersStack>


                 <Separator style={{ margin: '12px 0' }} />
                 <Div id='desk'>{state.description || 'Требуем понизить цену на сырки'}</Div>


               </Group>
               <Group title='Информация о петиции'>
                   <FormLayout>

                    {
                      state.isCurrentGroupAdmin && state.currentGroupInfo &&

                      <Group title='Автор'>
                      <Radio
                        name="radio"
                        value="user"
                        onChange={(e) => setParentState({
                          groupSelected: false
                        })}
                        checked={!state.groupSelected}
                      >{state.fetchedUser.first_name} {state.fetchedUser.last_name}
                      </Radio>
                      <Radio
                        name="radio"
                        value="group"
                        checked={state.groupSelected}
                        onChange={(e) => setParentState({
                          groupSelected: e.currentTarget.checked
                        })}
                        description="Петиция будет опубликована от имени этого сообщества">
                        {state.currentGroupInfo.name}
                      </Radio>
                      </Group>
                    }
                       <Input
                           type="text"
                           top={ `Название ${symbols_name}` }
                           name="name"
                           maxLength='60'
                           value={ name }
                           placeholder={'Сырки дорогие!'}
                           onChange={ onChange }
                       />
                       <Textarea
                           top={  `Описание ${symbols_description }` }
                           maxLength='254'
                           name="description"
                           placeholder="Требуем понизить цену на сырки"
                           value={ description }
                           onChange={ onChange }
                       />
                       <Input
                           type="date"
                           top={ formLang.start }
                           name="start_date"
                           value={ start }
                           onChange={ onChange }
                       />
                    {/*   <Input
                           type="time"
                           name="start_time"
                           onChange={ onChange }
                       />*/}
                       <Input
                           type="date"
                           top={ formLang.finish }
                           name="finish_date"
                           value={ finish }
                           onChange={ onChange }
                       />
                    {/* <Input
                           type="time"
                           name="finish_time"
                           onChange={ onChange }
                       />*/}
                       <File
                           id='file'
                           maxfiles={1}
                           acceptfiletypes={['image/png', 'image/jpg', 'image/jpeg', '.png']}
                           minfilesize={0}
                           top={ formLang.photo }
                           type="file"
                           name="file"
                           onChange={ onChange }
                       />
                      { this.state.error &&  <Div>{this.state.message}</Div>}
                      { photo &&  <UsersStack onClick={() => connect.send("VKWebAppShowImages", { images: [ photo ] })} photos={[ photo ]}>Обложка загружена</UsersStack>}
                       <Checkbox checked={state.accept} onChange={ (e) => this.props.setParentState({ accept: e.currentTarget.checked }) }>Согласен с
                       <Link target="_blank" href="https://vk.com/@virtualmeetingsclub-pravila-razmescheniya"> правилами</Link></Checkbox>
                       <Checkbox disabled={state.noty} checked={state.noty} onChange={ (e) => {
                         if(e.currentTarget.checked){
                            console.log('отправили!')
                            connect.send("VKWebAppAllowMessagesFromGroup", { "group_id": 189366357 });
                         }
                       }}>
                       Уведомить о результате модерации
                      </Checkbox>
                       <Button size="xl" disabled={this.state.disabled} onClick={ () => {
                         const name = state.name.replace(/\s/g, '');
                         const description = state.description.replace(/\s/g, '');

                         if(name === undefined || name.length < 5){
                            openErrorSnackbar('Название петиции указано неверно.');
                           return
                         }
                         if(description === undefined || description < 5){
                            openErrorSnackbar('Описание петиции указано неверно.');
                           return
                         }
                         if(!start_date){
                            openErrorSnackbar('Дата начала не указана.');
                           return
                         }
                         if(!finish_date){
                            openErrorSnackbar('Дата окончания не указана.');
                           return
                         }
                         if(Date.parse(start_date) > Date.parse(finish_date)){
                            openErrorSnackbar('Дата окончания петиции раньше даты начала.');
                           return
                         }
                         if((Date.parse(start_date) < Date.parse(new Date())) && (  new Date(start_date).getDay() < new Date().getDay()  )){
                            openErrorSnackbar('Дата начала петиции уже прошла.');
                           return
                         }
                         if(!accept){
                            openErrorSnackbar('Вы не согласились с правилами.');
                           return
                         }
                         if(!photo){
                            openErrorSnackbar('Обложка петиции обязательна.');
                           return
                         }

                         this.AddMeet();
                         connect.unsubscribe(this.sub);
                       } }>
                           { this.state.disabled ? <Spinner /> : formLang.add }
                       </Button>
                   </FormLayout>
                   </Group>
                   {snackbar}
            </Panel>
        );
    }
}

export default AddMeetPage;
