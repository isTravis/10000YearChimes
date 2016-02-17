var bellTimeouts = [null,null,null,null,null,null,null,null,null,null];

var BellRow = React.createClass({
	getDefaultProps: function() {
		return {
			sequence: []
		};
	},

	componentDidMount: function() {
		document.getElementById('cover-' + this.props.index).style.transition = '0s linear transform';
		document.getElementById('cover-' + this.props.index).style.transform = 'translateX(-100%)';
	},

	componentWillUpdate: function(nextProps) {
		if (!this.props.play && nextProps.play) {
			setTimeout(()=>{
				this.playSequence();
			},100);
		}

		if (!nextProps.play) {
			this.stopSequence();
		}
	},

	onRowClick: function() {
		return this.props.setCurrentSequence(this.props.index);
	},

	stopSequence: function() {
		for (var index = 1; index < 11; index++) {
			clearTimeout(bellTimeouts[index-1]);
			var audio = document.getElementById('bell' + index);
			if (audio) {
				audio.pause();
				audio.currentTime = 0;	
			}
			
		}
		document.getElementById('cover-' + this.props.index).style.transition = '0s linear transform';
		document.getElementById('cover-' + this.props.index).style.transform = 'translateX(-100%)';
		
	},

	playBell: function(index, delay) {
		bellTimeouts[index-1] = setTimeout(function(){
			document.getElementById('bell' + index).play();
		}, delay);
	},

	playSequence: function() {
		var bellSequence = this.props.sequence;
		for (var index = 0; index < 10; index++) {
			this.playBell(bellSequence[index], index * 500);
		}
		document.getElementById('cover-' + this.props.index).style.transition = '5s linear transform';
		document.getElementById('cover-' + this.props.index).style.transform = 'translateX(0%)';
	},

	rowDate: function() {
		var d = new Date(this.props.setDate);
		var newDate = new Date(d.setDate(d.getDate() - 4 + this.props.index));
		var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		return monthNames[newDate.getMonth()] + '-' + newDate.getDate();
	},

	render: function() {

		var bellColors = {
			1: '#c0392b',
			2: '#d35400',
			3: '#e67e22',
			4: '#f39c12',
			5: '#16a085',
			6: '#27ae60',
			7: '#2980b9',
			8: '#8e44ad',
			9: '#2c3e50',
			10: '#7f8c8d'
		};
		return (
			<div className="bellWrapper" onClick={this.onRowClick}>
				<div id={'cover-' + this.props.index} className="cover"></div>
				<div className="hoverbar"></div>
				<div className={'rowDate' + (this.props.index === 5 ? ' mainRowDate' : '')}>{this.rowDate()}</div>
				{
					this.props.sequence.map((bellNum)=>{
						return <div key={'bell-' + bellNum} className={'bellBlock'} style={{backgroundColor: bellColors[bellNum]}}></div>
					})
				}
			</div>
		)
	}
});

var BellPlayer = React.createClass({
	getInitialState: function() {
		return {
			currentSequences: [[]],
			currentSequenceIndex: undefined,
			currentDate: undefined,
		};
	},

	componentDidMount: function() {
		this.dateChanged();
	},

	daysSinceStart: function(date) {
		var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
		var firstDate = new Date(2000, 0, 0);
		var secondDate = date;
		var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay))) - 1;
		return diffDays;
	},

	calculateSequenceBlock: function(centerDayNumber) {
		var newSequenceBlock = [];
		for(var i = -5; i<6; i++) {
			newSequenceBlock.push(this.calculateSequence(centerDayNumber + i));
		}
		return newSequenceBlock;
	},

	calculateSequence: function(dayNumber) {
		var bellSequence = [];
		for (var index = 1; index < 11; index++) {
			var bellIndex = dayNumber % index;
			bellSequence.splice(bellIndex, 0, index);
		}
		return bellSequence;
	},
	
	setCurrentSequence: function(sequenceIndex) {
		if (this.state.currentSequenceIndex === sequenceIndex) { 
			this.setState({currentSequenceIndex: undefined})
		} else {
			this.setState({currentSequenceIndex: sequenceIndex})	
		}
	},

	dateChanged: function() {
		var dayCount = this.daysSinceStart(new Date(this.refs.inputDate.value));
		var sequences = this.calculateSequenceBlock(dayCount);
		this.setState({
			currentSequences: sequences,
			currentSequenceIndex: undefined,
			currentDate: new Date(this.refs.inputDate.value)
		});
	},
	
	getToday: function() {
		var date = new Date();
		return date.getFullYear() + '-' + (date.getMonth.length < 2 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1) ) + '-' + date.getDate();
	},

	render: function() {
		
		return (
			<div>
				<input type="date" min="2000-01-01" name="inputDate" id="inputDate" ref="inputDate" defaultValue={this.getToday()} onChange={this.dateChanged}/>
				{this.state.currentDate && isNaN( this.state.currentDate.getTime())
					? <div className="invalidDate">Not a valid date</div>
					: this.state.currentSequences.map((sequence, index)=>{
						return (
							<BellRow 
								key={'sequence-' + index}
								index={index}
								sequence={sequence} 
								setCurrentSequence={this.setCurrentSequence} 
								play={this.state.currentSequenceIndex === index} 
								setDate={this.state.currentDate} />		
						);
					})
				}
			</div>
		);
	}
});


ReactDOM.render(
	<BellPlayer />,
	document.getElementById('player')
);
