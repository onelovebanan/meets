import React from 'react';
import connect from '@vkontakte/vk-connect';
import { View, Epic, Tabbar, ConfigProvider, Snackbar, Avatar, TabbarItem, ScreenSpinner } from '@vkontakte/vkui';

import '@vkontakte/vkui/dist/vkui.css';
import './css/App.css';

import API from './js/api';
import { checkVersionAndroid, showAlert } from './js/helpers';

import Icon24List from '@vkontakte/icons/dist/24/list';
import Icon24FavoriteOutline from '@vkontakte/icons/dist/24/favorite_outline';
import Icon24Privacy from '@vkontakte/icons/dist/24/privacy';
import Icon24Add from '@vkontakte/icons/dist/24/add';
import Icon16Done from '@vkontakte/icons/dist/16/done';
import Icon16Clear from '@vkontakte/icons/dist/16/clear';

import Home from './panels/Home';
import Favorite from './panels/Favorite';
import Meet from './panels/Meet';
import MeetAdmin from './panels/MeetAdmin';
import AdminPage from './panels/AdminPage';
import AddMeetPage from './panels/AddMeetPage';
import Offline from './panels/Offline';
import Onboarding from './panels/Onboarding';
import Onboarding2 from './panels/Onboarding2';
import Onboarding3 from './panels/Onboarding3';
import Rules from './panels/Rules';

class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			activeStory: 'home',
			activePanel: 'meets',
			activeTab: 'all',
			snackbar: null,
			fetchedUser: {
				id: null
			},
			cache: null,
			popout: <ScreenSpinner />,
			offline: false,
			meets: false,
			symbols_name: '',
			symbols_description: '',
			accept: false,
			name: '',
			start_date: false, //0000-00-00
			finish_date: false, // 0000-00-00
			start_time: '00:00:00',
			finish_time: '00:00:00',
			description: '',
			photo: false,
			meet: false,
			noty: false,
			comments: false,
			currentMeetId: false,
			userMeets: false,
			allMeets: false
		};

		this.initApp();

		this.onStoryChange 	= this.onStoryChange.bind(this);
	}

		initApp = () => {
		if (window.location.hash === '#dark') {
			let schemeAttribute = document.createAttribute('scheme');
			schemeAttribute.value = 'client_dark';
			document.body.attributes.setNamedItem(schemeAttribute);
		}

		window.showOfflinePage = (e) => {
            this.setState({ offline: e });
		};

		window.showAlert = (message, title, actions) => {
            showAlert(this.setState.bind(this), message, title, actions);
		};

		window.showLoader = (show) => {
            this.setState({ popout: show ? <ScreenSpinner /> : null });
		};

		checkVersionAndroid();

		this.api = new API();
		this.checkRoute();
	}

	componentDidMount() {
		connect.subscribe(this.sub);
		connect.send('VKWebAppGetUserInfo', {});
		connect.send("VKWebAppSetViewSettings", {"status_bar_style": "light", "action_bar_color": "#0080b4"});
		setInterval(() => this.checkOnline(), 3000);
		this.getMeets();
	}
	 sub = e => {
		switch (e.detail.type) {
			case 'VKWebAppGetUserInfoResult':
				this.setState({ fetchedUser: e.detail.data });
				let user = this.state.fetchedUser
				this.addUser(user)
				break;
				case 'VKWebAppAllowMessagesFromGroupResult':
					this.setState({ noty: e.detail.data.result });
					console.log(this.state)
				break;
				case 'VKWebAppAccessTokenReceived':
				if(e.detail.data.scope === '') 	this.openErrorSnackbar('Действие отменено пользователем.')
				break;
				case 'VKWebAppAccessTokenFailed':
				this.openErrorSnackbar('Действие отменено пользователем.')
				break;
			default:
				// code
		}
	}
	// TODO: Нужен history для навигации назад с других экранов и системной кнопки назад на ведре
	onStoryChange = (story, panel) => { //  vkConnect.send('VKWebAppEnableSwipeBack');
	//	connect.unsubscribe(this.sub);
		let userId = this.state.fetchedUser.id
		this.setState({
			activeStory: story,
			activePanel: panel,
			comments: false,
			// snackbar: null
		});
		if(story !== 'home') this.setState({ snackbar: null });
		if(story === 'home') this.getMeets(this.state.fetchedUser.id);
		if(story === 'favorites') {
			let activeTab = this.state.activeTab
			if(activeTab === 'all'){
				this.getUserMeets(userId);
			} else if(activeTab === 'my'){
				this.getOwneredMeets(userId);
			} else if(activeTab === 'exp'){
				this.getExpiredUserMeets(userId);
			}
		}
		if(story === 'admin') this.getAllMeets(this.state.fetchedUser.id);
		if(panel !== 'meet') connect.send('VKWebAppDisableSwipeBack');
	}

	checkRoute = async e => {
		let route = window.location.hash.replace('#', '');
		console.log(route);
		if (route > 0) {
				const meet = await this.api.GetMeet(route);
				console.log(meet[0]);
				if(meet[0]) {
					this.setState({
						meet: meet[0],
						activePanel: 'meet'
					 });
				} else return
		} else return
	}
	checkOnline = e => {
		if(window.navigator.onLine){
			window.showOfflinePage(false);
		} else window.showOfflinePage(true);
	}
	makeStory = async (id) => {
		console.log('makeStory')
		let story = await this.api.getStory(id);
		story = 'data:image/png;base64,' + story.image.replace(`b'`,'').replace(`'`, '');
		console.log(story);
		let url = `https://vk.com/app7217332#${this.state.currentMeetId}`
		await connect.send("VKWebAppShowStoryBox", { "background_type" : "image", "locked": true, "blob": story, "attachment": {
			"text": "go_to",
			"type": "url",
			"url": url
		} });
	}

	openDoneSnackbar = e => {
		this.setState({
			snackbar: <Snackbar
										duration={2000}
										layout="vertical"
										onClose={() => this.setState({ snackbar: null })}
										before={<Avatar size={24} style={{ backgroundColor: '#4bb34b' }}><Icon16Done fill="#fff" width={14} height={14} /></Avatar>}
								>
									{e}
								</Snackbar>
		});
	}
	openErrorSnackbar = e => {
		this.setState({
			snackbar: <Snackbar
										duration={2000}
										layout="vertical"
										onClose={() => this.setState({ snackbar: null })}
										before={<Avatar size={24} style={{backgroundColor: '#FF0000'}}><Icon16Clear fill="#fff" width={14} height={14} /></Avatar>}
										>
										{e}
								</Snackbar>
		});
	}

	getMeets = async () => { // доступные митинги
			window.showLoader(true);
			this.setState({ meets: false });
			const meets = await this.api.GetMeets();
			this.setState({ meets });
			window.showLoader(false);
	}
	getExpiredUserMeets = async () => {
			this.setState({ userMeets: false });
			window.showLoader(true);
			const userMeets = await this.api.GetExpiredUserMeets(this.state.fetchedUser.id);
			this.setState({ userMeets });
			window.showLoader(false);
	}
	getOwneredMeets = async () => {
			this.setState({ userMeets: false });
			window.showLoader(true);
			const userMeets = await this.api.GetOwneredMeets(this.state.fetchedUser.id);
			this.setState({ userMeets });
			window.showLoader(false);
	}
	getUserMeets = async () => { // митинги, в которых учавствует юзер
			this.setState({ userMeets: false });
			window.showLoader(true);
			const userMeets = await this.api.GetUserMeets(this.state.fetchedUser.id);
			this.setState({ userMeets });
			window.showLoader(false);
	}
	getAllMeets = async () => { // админка
			window.showLoader(true);
			const allMeets = await this.api.GetAllMeets(this.state.fetchedUser.id);

			this.setState({ allMeets });
			window.showLoader(false);
	}
	getComments = async (meet) => {
			const comments = await this.api.GetComments();
			this.setState({ comments });
	}
	addUser = async (user) => { // добавить данные юзера в базу
			const isFirst = await this.api.IsFirst(user.id);
			if(isFirst){ // показываем онбординг, если юзер зашёл первый раз
				this.api.AddUser(user);
				this.onStoryChange('onboarding', 'onboarding');
			} else this.api.UpdateUser(user); // обновить данные юзера в базе
	}
	render() {
		const { api, state, onStoryChange, getMeets, makeStory, getComments,
			getUserMeets, openErrorSnackbar, openDoneSnackbar, getOwneredMeets, getExpiredUserMeets } = this;

		const { offline, popout, activeStory, meets, userMeets, allMeets,
			 activePanel, fetchedUser, comments } = this.state;

		const isUserAdmin = (
			this.state.fetchedUser.id === 35501089  ||
			this.state.fetchedUser.id === 236820864 ||
			this.state.fetchedUser.id === 87478742
		 );

		const props = { getOwneredMeets, getExpiredUserMeets, openDoneSnackbar,
			 openErrorSnackbar,	api, isUserAdmin, getUserMeets, state, activeStory,
			 makeStory, getComments, getMeets, meets, userMeets,
			allMeets, onStoryChange, fetchedUser,
			comments, setParentState: this.setState.bind(this) };

		const history = activePanel === 'meet' ? ['meets', 'meet'] : ['meets'];

		const onSwipeBack = e => {
			this.setState({ activePanel: 'meets' });
		}

		const views = { onSwipeBack, history, popout, activePanel };

		return (
			 <ConfigProvider>
				{
					offline ?
						<View id="offline"  popout={ popout } activePanel="offline">
							<Offline id="offline" { ...props } />
						</View>
						:
						<Epic activeStory={ activeStory } tabbar={
							(activeStory !== 'onboarding' && activePanel !== 'meet') && <Tabbar>
							<TabbarItem
								onClick={ () => this.onStoryChange('home', 'meets') }
								selected={ activeStory === 'home' }
							><Icon24List /></TabbarItem>
							<TabbarItem
								onClick={ () => this.onStoryChange('addMeet', 'addMeetPage') }
								selected={ activeStory === 'addMeet' }
							><Icon24Add /></TabbarItem>
							{ isUserAdmin && <TabbarItem
									onClick={ () => this.onStoryChange('admin', 'meets') }
									selected={ activeStory === 'admin' }
								><Icon24Privacy /></TabbarItem>}
								<TabbarItem
									onClick={ () => this.onStoryChange('favorites', 'meets') }
									selected={ activeStory === 'favorites' }
								><Icon24FavoriteOutline /></TabbarItem>
							</Tabbar>
						}>
							<View id="home"	{ ...views } >
								<Home id="meets" { ...props } />
								<Rules id="rules" { ...props } />
								<Meet id="meet" { ...props } />
							</View>
							<View id="addMeet" { ...views } >
								<AddMeetPage id="addMeetPage" { ...props } />
							</View>
							<View id="admin" { ...views } >
								<AdminPage id="meets" { ...props } />
								<MeetAdmin id='meetAdmin' { ...props } />
							</View>
							<View	id="favorites" { ...views } >
								<Favorite id="meets" { ...props } />
								<Meet id="meet" { ...props }/>
							</View>
							<View id="onboarding" { ...views } >
								<Onboarding id="onboarding" { ...props }/>
								<Onboarding2 id="onboarding2" { ...props }/>
								<Onboarding3 id="onboarding3" { ...props }/>
							</View>
						</Epic>
				}
			 </ConfigProvider>
		);
	}
}

export default App;
