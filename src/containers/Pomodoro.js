import React, { Component } from 'react';
import TypeSelect from '../components/TypeSelect/TypeSelect';
import TimeDisplay from '../components/TimeDisplay/TimeDisplay';
import Controls from '../components/Controls/Controls';
import Shortcuts from '../components/Shortcuts/Shortcuts';
import ToggleSound from '../components/ToggleSound/ToggleSound';
import ToggleTheme from '../components/ToggleTheme/ToggleTheme';
import ToggleTask from '../components/Tasks/TaskToggle';
import TaskList from '../components/Tasks/TaskList';
import './Pomodoro.css';

class Pomodoro extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedType: props.types[0],
            time: props.types[0].time,
            interval: null,
            running: false,
            sound:
                JSON.parse(window.localStorage.getItem('pomodoro-react-sound')) || true,
            theme:
                JSON.parse(window.localStorage.getItem('pomodoro-react-theme')),
            taskStatus:
                JSON.parse(window.localStorage.getItem('pomodoro-react-taskStatus')) ||
                null
        };
    }

    static defaultProps = {
        types: [
            { name: 'Pomodoro', time: 1500 },
            { name: 'Short Break', time: 300 },
            { name: 'Long Break', time: 900 }
        ]
    };

    componentDidMount() {
        document.addEventListener('keyup', this.handleKeyUp);
        Notification.requestPermission();
        this.sound = new Audio('bell.flac');
        this.sound.preload = 'auto';
    }

    componentWillUnmount() {
        document.removeEventListener('keyup', this.handleKeyUp);
    }

    handleKeyUp = event => {
        if (event.target.tagName === 'INPUT') return;
        if (event.key === ' ') {
            this.pauseTimer();
        } else if (event.key === 'Escape') {
            this.resetTimer();
        } else if (event.key >= 1 && event.key <= this.props.types.length) {
            this.changeType(this.props.types[event.key - 1]);
        }
    };

    changeType = type => {
        this.resetTimer();
        this.setState({ selectedType: type, time: type.time, running: false });
    };

    tick = () => {
        if (this.state.time <= 1) {
            this.stopInterval();
            this.setState({ running: false });
            if (this.state.sound) this.sound.play();
            try {
                navigator.serviceWorker.register('service-worker.js').then(sw => {
                    sw.showNotification(`${this.state.selectedType.name} finished!`);
                });
            } catch (e) {
                console.log('Notification error', e);
            }
        }
        this.setState(state => ({ time: state.time - 1 }));
    };

    stopInterval = () => {
        clearInterval(this.state.interval);
        this.setState({ interval: null });
    };

    startTimer = () => {
        this.setState(state => ({
            running: true,
            interval: setInterval(this.tick, 1000),
            time: state.time > 0 ? state.time : state.selectedType.time
        }));
        this.sound.pause();
        this.sound.currentTime = 0;
    };

    resetTimer = () => {
        this.stopInterval();
        this.setState(state => ({
            time: state.selectedType.time,
            running: false
        }));
    };

    pauseTimer = () => {
        this.state.interval ? this.stopInterval() : this.startTimer();
    };

    getStatus = () => {
        const { time, running, interval } = this.state;
        if (time === 0) return 'Finished';
        if (running && !interval) return 'Paused';
        if (running) return 'Running';
    };

    getProgress = () => {
        const current = this.state.time;
        const total = this.state.selectedType.time;
        return ((total - current) / total) * 100;
    };

    handleToggleSound = () => {
        this.setState(
            state => ({
                sound: !state.sound
            }),
            () => {
                window.localStorage.setItem('pomodoro-react-sound', this.state.sound);
            }
        );
    };

    handleToggleTask = () => {
        this.setState(
            state => ({
                taskStatus: !state.taskStatus
            }),
            () => {
                window.localStorage.setItem(
                    'pomodoro-react-taskStatus',
                    this.state.taskStatus
                );
            }
        );
    };

    setTheme = () => {
        this.setState(
            state => ({
                theme: this.state.theme
            }),
            () => {
                window.localStorage.setItem(
                    'pomodoro-react-theme',
                    this.state.theme
                );
            }
        );
    };

    render() {
        const { time, selectedType, sound, theme, taskStatus } = this.state;
        const { types } = this.props;
        console.log(this.state.theme);
        return (
            <div className="Content">
                <div className="Pomodoro">
                    <TypeSelect
                        types={types}
                        selected={selectedType}
                        changeType={this.changeType}
                    />
                    <TimeDisplay
                        time={time}
                        status={this.getStatus()}
                        progress={this.getProgress()}
                    />
                    <Controls
                        start={this.startTimer}
                        reset={this.resetTimer}
                        pause={this.pauseTimer}
                        status={this.getStatus()}
                    />
                    <div className="navbar">
                        <ToggleTask task={taskStatus} toggleTask={this.handleToggleTask} />
                        <Shortcuts />
                        <ToggleTheme theme={theme} toggleTheme={this.setTheme} />
                        <ToggleSound sound={sound} toggleSound={this.handleToggleSound} />
                    </div>
                </div>
                {taskStatus && (
                    <div className="TaskPanel">
                        <TaskList />
                    </div>
                )}
            </div>
        );
    }
}

export default Pomodoro;
