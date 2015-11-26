
/**
 * The main class of the MtrDatepicker
 * Here inside is covered everything that you need to know
 *
 * @class MtrDatepicker
 * @param {Object} inputConfig used for user configurations
 */
function MtrDatepicker(inputConfig) {
	



	/**
	 * The real implementation of the library starts here
	 */

	var self = this;

	// The main configuration properties
	// All of them can be overided by the ini method
	var config = {
		targetElement: null,
		defaultValues: {
			hours: 				[],
			minutes: 			[],
			dates: 				[],
			datesNames: 	[],
			months: 			[],
			years: 				[],
		},
		hours: {
			min: 1,
			max: 12,
			step: 1,
			maxlength: 2
		},
		minutes: {
			min: 0,
			max: 50,
			step: 10,
			maxlength: 2
		},
		months: {
			min: 0,
			max: 11,
			step: 1,
			maxlength: 2
		},
		years: {
			min: 2000,
			max: 2030,
			step: 1,
			maxlength: 4
		},
		animations: true,				// Deprecated for now, but resposible for the transition of the sliders - animated or static
		smartHours: false,			// Make auto swicth between AM/PM when moving from 11AM to 12PM
		future: false,					// Validate the date to be only in the future
		validateAfter: true,		// perform the future validation after the date change
		
		transitionDelay: 100,
		transitionValidationDelay: 500,
		references: { // Used to store references to the main elements
			hours: null
		},

		monthsNames: {
			0: "Jan",
			1: "Feb",
			2: "Mar",
			3: "Apr",
			4: "May",
			5: "Jun",
			6: "Jul",
			7: "Aug",
			8: "Sep",
			9: "Oct",
			10: "Nov",
			11: "Dec",
		},
		daysNames: {
			0: "Sun",
			1: "Mon",
			2: "Tue",
			3: "Wed",
			4: "Thu",
			5: "Fri",
			6: "Sat",
		}
	};																							

	// The main element which holds the datepicker 
	var targetElement;

	var values = {
		date: null,
		timestamp: null,
		ampm: true,
	};

	var browser = null;

	// Here are the attached user events
	var defaultChangeEventsCategories = {
		'all': [],
		'time': [],
		'date': [],

		'hour': [],
		'minute': [],
		'ampm': [],
		'day': [],
		'month': [],
		'year': [],
	};
	var events = {
		'onChange': clone(defaultChangeEventsCategories),
		'beforeChange': clone(defaultChangeEventsCategories),
		'afterChange': clone(defaultChangeEventsCategories)
	};

	// Keep the wheel scroll in a timeout
	var wheelTimeout = null;

	// Keep the arrow click in a timeout
	var arrowTimeout = {};

	/**
	 * The main init function which prepares the datepicker for use
	 *
	 * @param  {Object} inputConfig used to setup datepicker specific features
	 */
	var init = function(inputConfig) {

		browser = detectBrowser();

		setConfig(inputConfig);

		targetElement = byId(config.targetElement);
		
		setDatesRange();

		createMarkup();

		attachEvents();
	};


	/**
	 * Attaching the user input config settings to ovverride the default one
	 *
	 * @param {Object} input user input settings
	 */
	var setConfig = function(input) {
		config.targetElement = input.target;
		
		values.date = input.timestamp ? new Date(input.timestamp) : new Date();
		values.date.setSeconds(0);
		values.timestamp = values.date.getTime();
		
		config.animations = input.animations !== undefined ? input.animations : config.animations;
		config.future = input.future !== undefined ? input.future : config.future;
		config.validateAfter = input.validateAfter !== undefined ? input.validateAfter : config.validateAfter;
		config.smartHours = input.smartHours !== undefined ? input.smartHours : config.smartHours;

		// Init hours
		config.defaultValues.hours = createRange(config.hours);
		config.defaultValues.minutes = createRange(config.minutes);
		config.defaultValues.months = createRange(config.months);
		config.defaultValues.years = createRange(config.years);
	};

	var attachEvents = function() {

	};

	var setDatesRange = function(month, year) {
		month = month !== undefined ? month : getMonth();
		year = year !== undefined ? year : getYear();

		var datesRange = createRangeForDate(month, year);
		config.dates = {
			min: datesRange.min,
			max: datesRange.max,
			step: datesRange.step,
			maxlength: 2,
		};
		config.defaultValues.dates = datesRange.values;
		config.defaultValues.datesNames = datesRange.names;
	};

	/**
	 * Generate the main markup used from the datepicker
	 * This means that here we are generating input sliders for hours, minutes, months, dates and years
	 * and a radio input for swithing the time AM/PM
	 */
	var createMarkup = function() {

		// Clear all of the content of the target element
		removeClass(targetElement, 'mtr-datepicker');
		addClass(targetElement, 'mtr-datepicker');
		while (targetElement.firstChild) {
    	targetElement.removeChild(targetElement.firstChild);
		}

		// Create time elements
		var hoursElement = createSliderInput({
			name: 'hours',
			values: config.defaultValues.hours,
			value: getHours()
		});

		var minutesElement = createSliderInput({
			name: 'minutes',
			values: config.defaultValues.minutes,
			value: getMinutes()
		});

		var amPmElement = createRadioInput({
			name: 'ampm',
		});

		var rowTime = document.createElement('div');
		rowTime.className = 'mtr-row';

		var rowClearfixTime = document.createElement('div');
		rowClearfixTime.className = 'mtr-clearfix';

		rowTime.appendChild(hoursElement);
		rowTime.appendChild(minutesElement);
		rowTime.appendChild(amPmElement);

		targetElement.appendChild(rowTime);
		targetElement.appendChild(rowClearfixTime);

		// Create date elements
		var monthElement = createSliderInput({
			name: 'months',
			values: config.defaultValues.months,
			valuesNames: config.monthsNames,
			value: getMonth()
		}); 
		
		var dateElement = createSliderInput({
			name: 'dates',
			values: config.defaultValues.dates,
			valuesNames: config.defaultValues.datesNames,
			value: getDate()
		});

		var yearElement = createSliderInput({
			name: 'years',
			values: config.defaultValues.years,
			value: getYear()
		});
		
		var rowDate = document.createElement('div');
		rowDate.className = 'mtr-row';

		var rowClearfixDate = document.createElement('div');
		rowClearfixDate.className = 'mtr-clearfix';

		rowDate.appendChild(monthElement);
		rowDate.appendChild(dateElement);
		rowDate.appendChild(yearElement);
		
		targetElement.appendChild(rowDate);
		targetElement.appendChild(rowClearfixDate);

		setTimestamp(values.timestamp);
	};	

	/**
	 * This function is creating a slider input
	 *
	 * It is generating the required markup and attaching the needed event listeners
	 * The returned element is fully functional input field with arrows for navigating
	 * through the values
	 * 
	 * @param  {object} elementConfig 
	 * @return {HtmlElement}
	 */
	
	var createSliderInput = function(elementConfig) {
		var element = document.createElement('div');
		element.className = 'mtr-input-slider';
		config.references[elementConfig.name] = config.targetElement + '-input-' + elementConfig.name; 
		element.id = config.references[elementConfig.name];

		// First, let's init the main elements
		var divArrowUp = createUpArrow();
		var divArrowDown = createDownArrow();

		// Content of the input, holding the input and the available values
		var divContent = document.createElement('div');
		divContent.className = "mtr-content";

		var inputValue = createInputValue();
		var divValues = createValues();

		// The, let's append them to the element in the correct order
		element.appendChild(divArrowUp);

		// Append holder of the input and values to the main element
		divContent.appendChild(inputValue);
		divContent.appendChild(divValues);
		
		element.appendChild(divContent);

		element.appendChild(divArrowDown);

		// Here are the definitios of the functions which are used to generate the markup 
		// and to attach the needed event listeners

		function createUpArrow() {
			var divArrowUp = document.createElement('div');
			divArrowUp.className = 'mtr-arrow up';
			divArrowUp.appendChild(document.createElement('span'));

			// Attach event listener
			divArrowUp.addEventListener('click', function() {
				// Prevent blur event
				var input = qSelect(inputValue, '.mtr-input');
				addClass(inputValue, 'arrow-click');
				addClass(divContent, 'mtr-active');

				if (arrowTimeout[elementConfig.name]) {
					window.clearTimeout(arrowTimeout[elementConfig.name]);
				}

				arrowTimeout[elementConfig.name] = setTimeout(function() {	
					removeClass(inputValue, 'arrow-click'); 
					removeClass(divContent, 'mtr-active');
				}, 1000);

				// Change the value with the next one
				var name = elementConfig.name;
				var currentValue;

				switch(name) {
					case 'hours': currentValue = getHours(); break;
					case 'minutes': currentValue = getMinutes(); break;
					case 'dates': currentValue = getDate(); break;
					case 'months': currentValue = getMonth(); break;
					case 'years': currentValue = getYear(); break;
				}

				var indexInArray = config.defaultValues[name].indexOf(currentValue);
				indexInArray++;

				if (indexInArray >= config.defaultValues[name].length) {
					indexInArray = 0;
				}

				switch(name) {
					//case 'hours': setHours(config.defaultValues[name][indexInArray]); break;
					case 'hours': 
					 	// Check is we have to make a transform of the hour
					 	var newHour = config.defaultValues[name][indexInArray];
					 	if (getIsPm() && newHour !== 12) {
					 		newHour += 12;
					 	}
					 	setHours(newHour);
					 	break;
					case 'minutes': setMinutes(config.defaultValues[name][indexInArray]); break;
					case 'dates': setDate(config.defaultValues[name][indexInArray]); break;
					case 'months': setMonth(config.defaultValues[name][indexInArray]); break;
					case 'years': setYear(config.defaultValues[name][indexInArray]); break;
				}
			}, false);

			return divArrowUp;
		}

		function createDownArrow() {
			var divArrowDown = document.createElement('div');
			divArrowDown.className = 'mtr-arrow down';
			divArrowDown.appendChild(document.createElement('span'));

			divArrowDown.addEventListener('click', function(e) {
				// Prevent blur event
				var input = qSelect(inputValue, '.mtr-input');
				addClass(inputValue, 'arrow-click');
				addClass(divContent, 'mtr-active');

				if (arrowTimeout[elementConfig.name]) {
					window.clearTimeout(arrowTimeout[elementConfig.name]);
				}

				arrowTimeout[elementConfig.name] = setTimeout(function() {	
					removeClass(inputValue, 'arrow-click'); 
					removeClass(divContent, 'mtr-active');
				}, 1000);

				// Change the value with the prev one
				var name = elementConfig.name;
				var currentValue;
			
				switch(name) {
					case 'hours': currentValue = getHours(); break;
					case 'minutes': currentValue = getMinutes(); break;
					case 'dates': currentValue = getDate(); break;
					case 'months': currentValue = getMonth(); break;
					case 'years': currentValue = getYear(); break;
				}

				var indexInArray = config.defaultValues[name].indexOf(currentValue);
				indexInArray--;

				if (indexInArray < 0) {
					indexInArray = config.defaultValues[name].length - 1;
				}

				switch(name) {
					//case 'hours': setHours(config.defaultValues[name][indexInArray]); break;
					 case 'hours': 
					 	// Check is we have to make a transform of the hour
					 	var newHour = config.defaultValues[name][indexInArray];
					 	if (getIsPm() && newHour !== 12) {
					 		newHour += 12;
					 	}
					 	setHours(newHour); 
					 	break;
					case 'minutes': setMinutes(config.defaultValues[name][indexInArray]); break;
					case 'dates': setDate(config.defaultValues[name][indexInArray]); break;
					case 'months': setMonth(config.defaultValues[name][indexInArray]); break;
					case 'years': setYear(config.defaultValues[name][indexInArray]); break;
				}
			}, false);

			return divArrowDown;
		}

		function createInputValue() {
			var inputValue = document.createElement('input');
			inputValue.value = elementConfig.value;
			inputValue.type = 'text';
			inputValue.className = 'mtr-input ' + elementConfig.name;
			inputValue.style.display = 'none';

			// Attach event listeners
			inputValue.addEventListener('blur', function(e) {
				// Blur event has to be calles after specific ammount of time
				// because it can be cause from an arrow button. In this case
				// we shouldn't apple the blur event body	
				setTimeout(function() {
					blurEvent();
				}, 500);
			
				function blurEvent() {
					var newValue = inputValue.value;
					var oldValue = inputValue.getAttribute('data-old-value');

					// If the blur is called after click on arrow we shoulnt update the value
					if (e.target.className.indexOf('arrow-click') > -1) {
						removeClass(e.target, 'arrow-click');
						return;
					}

					// If this is the month input we should decrement it because
					// the months are starting from 0
					if (inputValue.className.indexOf('months') > -1) {
						newValue--;
					}

					// Validate the value
					if (validateValue(elementConfig.name, newValue) === false) {
						inputValue.value = oldValue;
						inputValue.focus();
						return;
					}

					// If the future detection is ON validate the value again
					var target = elementConfig.name.substring(0, elementConfig.name.length-1);
					if (elementConfig.name === 'dates') {
						target = 'day';
					}

					if (config.future && !validateChange(target, newValue, oldValue)) {
						if (elementConfig.name === 'months') {
							oldValue++;
						}

						inputValue.value = oldValue;
						inputValue.focus();
						return;
					}

					inputValue.style.display = 'none';

					switch(elementConfig.name) {
						case 'hours': setHours(newValue); break;
						case 'minutes': setMinutes(newValue); break;
						case 'dates': setDate(newValue); break;
						case 'months': setMonth(newValue); break;
						case 'years': setYear(newValue); break;
					}
				}
			}, false);

			// On wheel scroll we should change the value in the input
			inputValue.addEventListener('wheel', function(e) {
				e.preventDefault();
				e.stopPropagation();

				// If the user is using the mouse wheel the values should be changed
				var target = e.target;
				var wheelData = e.wheelDeltaY;

				var oldValue = parseInt(inputValue.value),
						newValue;

				var configMin = config[elementConfig.name].min,
						configMax = config[elementConfig.name].max,
						configStep = config[elementConfig.name].step;

				if (elementConfig.name === 'months') {
					// If we are scrolling the months we should increment the value
					configMin++;
					configMax++;
				}

				if (wheelData > 0) { // Scroll up
					if (oldValue < configMax) {
						newValue = oldValue + configStep;
					}
					else {
						newValue = configMin;
					}
				}
				else { // Scroll down
					if (oldValue > configMin) {
						newValue = oldValue - configStep;
					}
					else {
						newValue = configMax;
					}
				}

				inputValue.value = newValue;
				return false;
			}, false);

			// On keybard press we should accept the new value
			inputValue.addEventListener('keypress', function(e) {
				var keyCode = e.keyCode || e.which; 				
				var allowed = [9, 13, 27, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57];
				
				// Not working in Firefox
				// if (allowed.indexOf(keyCode) === -1) {
				// 	e.preventDefault();
				// 	return false;
				// }

				if (keyCode >= 97 && keyCode <= 119) {
					e.preventDefault();
					return false;
				}

				switch(keyCode) {
					case 13: // enter
					case 27: // escape
						inputValue.blur();
						return false;

					case 9: // tab
						break;

					default:
						if (inputValue.value.length === config[elementConfig.name].maxlength && allowed.indexOf(keyCode) > -1) {
							e.preventDefault();
							return false;
						}
						break;
				}
			}, false);
			
			return inputValue;	
		}
		
		function createValues() {
			var divValues = createElementValues(elementConfig);
			return divValues;
		}
		
		return element;
	};

	/**
	 * Create HtmlElement with a radio button control
	 * 
	 * @param  {object} elementConfig [description]
	 * @return {HtmlElement}               [description]
	 */
	var createRadioInput = function(elementConfig) {
		var element = document.createElement('div');
		element.className = 'mtr-input-radio';
		config.references[elementConfig.name] = config.targetElement + '-input-' + elementConfig.name; 
		element.id = config.references[elementConfig.name];

		var formHolder = document.createElement('form');
		formHolder.name = config.references[elementConfig.name];

		// First create the elements
		var radioAm = createInputValue('ampm', 1, 'AM');
		var radioPm = createInputValue('ampm', 0, 'PM');

		formHolder.appendChild(radioAm);
		formHolder.appendChild(radioPm);

		formHolder.ampm.value = getIsAm() ? '1' : '0';

		element.appendChild(formHolder);

		function createInputValue(radioName, radioValue, labelValue) {
			var divHolder = document.createElement('div');
			var label = document.createElement('label');
			var input = document.createElement('input');
			var elementId = config.targetElement + '-radio-' + radioName + '-' + labelValue;

			var innerHtmlSpanValue = document.createElement('span');
			innerHtmlSpanValue.className = 'value';
			innerHtmlSpanValue.appendChild(document.createTextNode(labelValue));
			
			var innerHtmlSpanRadio = document.createElement('span');
			innerHtmlSpanRadio.className = 'radio';

			label.setAttribute('for', elementId);
			label.appendChild(innerHtmlSpanValue);
			label.appendChild(innerHtmlSpanRadio);

			input.className = 'mtr-input ';
			input.type = 'radio';
			input.name = radioName;
			input.id = elementId;
			input.value = radioValue;

			divHolder.appendChild(input);
			divHolder.appendChild(label);

			// Attach event listeners
			input.addEventListener('change', function(e) {
				var result = setAmPm(radioValue);

				if (!result && config.future) {
					setAmPm(!radioValue);
					e.preventDefault();
					e.stopPropagation();
					return false;
				}
			}, false);

			return divHolder;
		}

		return element;
	};

	/**
	 * This function is creating a new set of HtmlElement which 
	 * contains the default values for a specific input
	 * 
	 * @param  {obect} elementConfig 
	 * @return {HtmlElement}
	 */
	var createElementValues = function(elementConfig) {
			
		var divValues = document.createElement('div');
		divValues.className = 'mtr-values';

		elementConfig.values.forEach(function(value) {
			var innerHTML = elementConfig.name === 'months' ? value+1 : value;

			var divValueHolder = document.createElement('div');
			divValueHolder.className = 'mtr-default-value-holder';
			divValueHolder.setAttribute('data-value', value);

			var divValue = document.createElement('div');
			divValue.className = 'mtr-default-value';
			divValue.setAttribute('data-value', value);

			if (elementConfig.name === 'minutes' && value === 0) {
				divValue.appendChild(document.createTextNode('00'));
			}
			else {
				divValue.appendChild(document.createTextNode(innerHTML));
			}

			divValueHolder.appendChild(divValue);

			if (elementConfig.valuesNames) {
				var divValueName = document.createElement('div');
				divValueName.className = 'mtr-default-value-name';
				divValueName.appendChild(document.createTextNode(elementConfig.valuesNames[value]));

				divValue.className += ' has-name';

				divValueHolder.appendChild(divValueName);
			}

			divValues.appendChild(divValueHolder);
		});

		// Attach listeners
		divValues.addEventListener('click', function() {
			// Show the input field for manual setup
			var parent = divValues.parentElement,
					inputValue = qSelect(parent, '.mtr-input');
			
			// If we are working with months we have to incement the value
			// because the months are starting from 0
			if (inputValue.className.indexOf('months') > -1) {
				inputValue.value = parseInt(inputValue.value) + 1;
			}

			inputValue.style.display = "block";
			inputValue.focus();

		}, false);

		divValues.addEventListener('wheel', function(e) {
			e.preventDefault();
			e.stopPropagation();

			if (wheelTimeout) {
				return false;
			}

			// If the user is using the mouse wheel the values should be changed
			var target = e.target;
			var parent = target.parentElement.parentElement.parentElement.parentElement; // value -> values -> content -> input slider
			var values = qSelect(parent, '.mtr-values');
			var input = qSelect(parent, '.mtr-input');
			var wheelData = e.wheelDeltaY;

			var arrow;

			if (wheelData > 0) { // Scroll up
				arrow = qSelect(parent, '.mtr-arrow.up');
			}
			else { // Scroll down
				arrow = qSelect(parent, '.mtr-arrow.down');
			}

			wheelTimeout = setTimeout(function() {
				clearWheelTimeout();
			}, 100);

			arrow.click();	
			return false;
		}, false);

		divValues.addEventListener('touchstart', function(e) {
			e.preventDefault();
			e.stopPropagation();
			return false;
		}, false);

		divValues.addEventListener('touchmove', function(e) {
			e.preventDefault();
			e.stopPropagation();
			return false;
		}, false);

		return divValues;
	};

	var rebuildElementValues = function(reference, data) {
		var element = byId(reference);
		var elementContent = qSelect(element, '.mtr-content');
		var elementContentValues = qSelect(elementContent, '.mtr-values');

		elementContentValues.parentNode.removeChild(elementContentValues);
		var elementContentNewValues = createElementValues({
			name: data.name,
			values: data.values,
			valuesNames: data.valuesNames
		});

		elementContent.appendChild(elementContentNewValues);
	};

	/**
	 * Updating the date when a month or year is changed
	 * It should realculate the dates in the specific month and check
	 * the postition of the date (if it's bigger than the last date of the month)
	 * 
	 * @param  {Number} newMonth [description]
	 * @param  {NUmber} newYar   [description]
	 */
	var updateDate = function(newMonth, newYear) {
		newMonth = newMonth !== undefined ? newMonth : getMonth();
		newYear = newYear !== undefined ? newYear : getYear();

		// After month change we should recalculate the range of the dates
		setDatesRange(newMonth, newYear);
		rebuildElementValues(config.references.dates, {
			name: 'dates',
			values: config.defaultValues.dates,
			valuesNames: config.defaultValues.datesNames
		});

		// After the change in the dates of the month we should check is the current date exist
		// because if the current date is 31 and the month has only 30 days it is not correct
		var maxDay = config.defaultValues.dates[config.defaultValues.dates.length-1];
		var currentDate = getDate();

		if (currentDate > maxDay) {
			setDate(maxDay);
		}
	};

	var validateValue = function(type, value) {
		value = parseInt(value);

		// Strict, the value is exact in the array
		return config.defaultValues[type].indexOf(value) > -1 ? true : false; 
	};

	/**
	 * This function is validating the change of the date
	 *
	 * If the config.feature is enabled this function will prevent selecting dates
	 * in the past
	 * 
	 * @param  {String} target   
	 * @param  {Number} newValue 
	 * @param  {Number} oldValue 
	 * @return {boolean}          
	 */
	var validateChange = function(target, newValue, oldValue) {
		if (config.future === false)
			return true;

		var dateNow = new Date(),
				datePicker = new Date(values.date.getTime());

		switch(target) {
			case 'hour':	
				var isAm = getIsAm();
				if (isAm && newValue === 12) {
					newValue = 0;
				}
				// else if (!isAm && newValue < 12) {
				// 	newValue += 12;
				// }
				datePicker.setHours(newValue); 
				break;
			case 'minute':	datePicker.setMinutes(newValue); break;
			case 'ampm':
				var currentHours = datePicker.getHours(),
						currentAmPm = (currentHours >= 0 && currentHours <= 11) ? true : false,
						newHours = currentHours;

				if (newValue != oldValue) {
					if (newValue == true && currentHours > 12) { // set AM
						newHours = currentHours - 12;
					}
					else if (newValue == true && currentHours == 12) {
						newHours = 0;
					}
					else if (newValue == false && currentHours < 12) { // Set PM
						newHours = currentHours + 12;
					}
					else if (newValue == false && currentHours == 12) { // Set PM
						newHours = 12;
					}
				}

				datePicker.setHours(newHours);
				break;
			case 'day':	datePicker.setDate(newValue); break;
			case 'month':	datePicker.setMonth(newValue); break;
			case 'year':	datePicker.setFullYear(newValue); break;
		}
		
		dateNow.setSeconds(0);
		dateNow.setMilliseconds(0);
		datePicker.setSeconds(0);
		datePicker.setMilliseconds(0);

		if (datePicker.getTime() < dateNow.getTime()) {
			return false;
		}
		return true;
	};

	var clearWheelTimeout = function() {
		wheelTimeout = null;
	};

	/*****************************************************************************
	 * A lot of getters and setters now
	 ****************************************************************************/

	var setHours = function(input, preventAnimation) {
		var oldValue = values.date.getHours();
		var isChangeValid = validateChange('hour', input, oldValue);
		var isAm = getIsAm();

		// If the smart hourrs are enabled and we want to gto from X Am to 12 PM, we should
		// deisable the validation
		if (config.smartHours && input === 12 && isAm) {
			isChangeValid = true;
		}

		if (!config.validateAfter && !isChangeValid) {
			showInputSliderError(config.references.hours);
			return;
		}
		executeChangeEvents('hour', 'beforeChange', input, oldValue);
		var newHour = input;
		if (input > 12) {
			input -= 12; 			// reduce the values with 12 hours
		}

		updateInputSlider(config.references.hours, input, preventAnimation);

		if (config.validateAfter && !isChangeValid) {
			showInputSliderError(config.references.hours);

			setTimeout(function() {
				if (oldValue > 12) {
					oldValue -= 12;
				}
				updateInputSlider(config.references.hours, oldValue, preventAnimation);

				executeChangeEvents('hour', 'onChange', input, oldValue);
				executeChangeEvents('hour', 'afterChange', input, oldValue);
			}, config.transitionValidationDelay);
		}
		else {
			values.timestamp = values.date.setHours(newHour);
			if (config.smartHours && newHour === 12 && isAm) {
				values.timestamp = values.date.setHours(12);
				setAmPm(false); 	// set to PM
			}
			else if (!config.smartHours && newHour === 12 && isAm) {
				values.timestamp = values.date.setHours(0);
			}
			else {
				values.timestamp = values.date.setHours(newHour);
			}

			if (newHour > 12) {
				newHour -= 12; 			// reduce the values with 12 hours
				setAmPm(false); 	// set to PM
			}

			executeChangeEvents('hour', 'onChange', input, oldValue);
			executeChangeEvents('hour', 'afterChange', input, oldValue);
		}
	};

	var getHours = function() {
		var currentHours = values.date.getHours(),
				isAm = getIsAm();

		if (currentHours === 12 || currentHours === 0) {
			return 12;
		}
		return (currentHours < 12 && isAm) ? currentHours : currentHours - 12;
	};

	var setMinutes = function(input, preventAnimation) {
		var oldValue = values.date.getMinutes();
		var isChangeValid = validateChange('minute', input, oldValue);

		if (!config.validateAfter && !isChangeValid) {
			showInputSliderError(config.references.minutes);
			return;
		}
		executeChangeEvents('minute', 'beforeChange', input, oldValue);
		// TODO: validate
		var defaultValues = config.defaultValues.minutes;
		updateInputSlider(config.references.minutes, input, preventAnimation);

		if (config.validateAfter && !isChangeValid) {
			showInputSliderError(config.references.minutes);
			setTimeout(function() {
				updateInputSlider(config.references.minutes, oldValue, preventAnimation);

				executeChangeEvents('minute', 'onChange', input, oldValue);
				executeChangeEvents('minute', 'afterChange', input, oldValue);
			}, config.transitionValidationDelay);
		}
		else {
			values.timestamp = values.date.setMinutes(input);
			executeChangeEvents('minute', 'onChange', input, oldValue);
			executeChangeEvents('minute', 'afterChange', input, oldValue);
		}
	};

	var getMinutes = function() {
		return values.date.getMinutes();
	};

	var setAmPm = function(setAmPm) {
		var oldValue = getIsAm();
		if (!validateChange('ampm', setAmPm, oldValue)) {
			showInputRadioError(config.references.ampm, setAmPm);

			if (browser.isSafari) {
				setTimeout(function() {
					setRadioFormValue(config.references.ampm, oldValue);	
				}, 10);
				
			}
			return false;
		}
		executeChangeEvents('ampm', 'beforeChange', setAmPm, oldValue);
		// TODO: validate

		var currentHours = values.date.getHours(); 
		var currentHoursCalculates = getHours(); 
		
		var currentIsAm = getIsAm();

		if (currentIsAm !== setAmPm) {
			if (setAmPm == true && currentHours >= 12 ) { // Set AM
				currentHours -= 12;
				values.timestamp = values.date.setHours(currentHours);
			}
			else if (setAmPm == false && currentHours < 12) { // Set PM
				currentHours += 12;
				values.timestamp = values.date.setHours(currentHours);
			}
		}

		values.ampm = setAmPm;
		setRadioFormValue(config.references.ampm, setAmPm);

		executeChangeEvents('ampm', 'onChange', setAmPm, oldValue);
		executeChangeEvents('ampm', 'afterChange', setAmPm, oldValue);
		return true;
	};
	
	var setRadioFormValue = function(reference, setAmPm) {
		var divRadioInput = byId(reference);
		var formRadio = qSelect(divRadioInput, 'form');

		formRadio.ampm.value = setAmPm ? '1' : '0';
		var labelAmPm = setAmPm ? 'AM' : 'PM';

		var radioAm = qSelect(formRadio, 'input.mtr-input[type="radio"][value="1"]');
		var radioPm = qSelect(formRadio, 'input.mtr-input[type="radio"][value="0"]');

		var label = qSelect(formRadio, 'label[for="'+config.targetElement+'-radio-ampm-'+labelAmPm+'"]');
		var checkbox = qSelect(label, 'checkbox');

		if (setAmPm) {
			radioAm.setAttribute('checked', '');
			radioAm.checked = true;
			radioPm.removeAttribute('checked');
		}
		else {
			radioPm.setAttribute('checked', '');
			radioPm.checked = true;
			radioAm.removeAttribute('checked');	
		}
	}

	var getIsAm = function() {
		var currentHours = values.date.getHours();
		return (currentHours >= 0 && currentHours <= 11) ? true : false; 
		//return values.date.toLocaleTimeString().indexOf('AM') > -1 ? 1 : 0;
		//return values.ampm;
	};

	var getIsPm = function() {
		return !getIsAm();
	};

	var setDate = function(newDate, preventAnimation) {
		var oldValue = values.date.getDate();
		var isChangeValid = validateChange('day', newDate, oldValue);

		if (!config.validateAfter && !isChangeValid) {
			showInputSliderError(config.references.dates);
			return;
		}
		executeChangeEvents('day', 'beforeChange', newDate, oldValue);

		// TODO: Validate input
		updateInputSlider(config.references.dates, newDate, preventAnimation);

		if (config.validateAfter && !isChangeValid) {
			showInputSliderError(config.references.dates);
			setTimeout(function() {
				updateInputSlider(config.references.dates, oldValue, preventAnimation);

				executeChangeEvents('day', 'onChange', newDate, oldValue);
				executeChangeEvents('day', 'afterChange', newDate, oldValue);
			}, config.transitionValidationDelay);
		}
		else {
			values.timestamp = values.date.setDate(newDate);
			executeChangeEvents('day', 'onChange', newDate, oldValue);
			executeChangeEvents('day', 'afterChange', newDate, oldValue);
		}
	};

	var getDate = function() {
		return values.date.getDate();
	};

	var setMonth = function(newMonth, preventAnimation) {
		var oldValue = values.date.getMonth();
		var isChangeValid = validateChange('month', newMonth, oldValue);

		if (!config.validateAfter && !isChangeValid) {
			showInputSliderError(config.references.months);
			return;
		}
		executeChangeEvents('month', 'beforeChange', newMonth, oldValue);
		// TODO: Validate input

		// Finally, update the month
		updateInputSlider(config.references.months, newMonth, preventAnimation);

		if (config.validateAfter && !isChangeValid) {
			showInputSliderError(config.references.months);
			setTimeout(function() {
				updateInputSlider(config.references.months, oldValue, preventAnimation);

				executeChangeEvents('month', 'onChange', newMonth, oldValue);
				executeChangeEvents('month', 'afterChange', newMonth, oldValue);
			}, config.transitionValidationDelay);
		}
		else {
			values.timestamp = values.date.setMonth(newMonth);
			updateDate(newMonth);
			executeChangeEvents('month', 'onChange', newMonth, oldValue);
			executeChangeEvents('month', 'afterChange', newMonth, oldValue);
		}

	};

	var getMonth = function() {
		return values.date.getMonth();
	};

	var setYear = function(newYear, preventAnimation) {
		var oldValue = values.date.getFullYear();
		var isChangeValid = validateChange('year', newYear, oldValue);

		if (!config.validateAfter && !isChangeValid) {
			showInputSliderError(config.references.years);
			return;
		}
		executeChangeEvents('year', 'beforeChange', newYear, oldValue);
		// TODO: Validate input
		updateDate(undefined, newYear); 
		updateInputSlider(config.references.years, newYear, preventAnimation);

		if (config.validateAfter && !isChangeValid) {
			showInputSliderError(config.references.years);
			setTimeout(function() {
				updateInputSlider(config.references.years, oldValue, preventAnimation);

				executeChangeEvents('year', 'onChange', newYear, oldValue);
				executeChangeEvents('year', 'afterChange', newYear, oldValue);
			}, config.transitionValidationDelay);
		}
		else {
			values.timestamp = values.date.setFullYear(newYear);
			executeChangeEvents('year', 'onChange', newYear, oldValue);
			executeChangeEvents('year', 'afterChange', newYear, oldValue);
		}
	};

	var getYear = function() {
		return values.date.getFullYear();
	};

	// Bigger getter and setters
	var getTime = function() {
		return getHours() + ':' + getMinutes();
	};

	var getFullTime = function() {
		return getHours() + ':' + getMinutes() + ' ' + (getIsAm() ? 'AM' : 'PM');
	};

	var setTimestamp = function(input) {
		var roundedTimestamp = roundUpTimestamp(input);

		values.date = new Date(roundedTimestamp);
		values.timestamp = roundedTimestamp;

		var currentHours = values.date.getHours(),
				currentMinutes = getMinutes(),
				currentAmPm = (currentHours >= 0 && currentHours < 12) ? true : false,
				currentDate = getDate(),
				currentMonth = getMonth(),
				currentYear = getYear();

		currentHours = (currentHours === 0) ? 12 : currentHours;

		/* Deprecating for now, can be cleared after a few commits
		// Get the closest minutes
		var defaultMinutes = config.defaultValues.minutes;
		for (var iMinutes = 0; iMinutes < defaultMinutes.length; iMinutes++) {
			var currentValue = defaultMinutes[iMinutes],
					nextValue;
			
			if (iMinutes+1 === defaultMinutes.length) {
				nextValue = defaultMinutes[0];
			}
			else {
				nextValue = defaultMinutes[iMinutes+1];
			}

			if (currentMinutes === currentValue) {
				// The minutes values is the same as the default value
				break;
			}
			else if (currentMinutes > currentValue && currentMinutes < nextValue) {
				// The minutes values will assign the next possible values from the list
				currentMinutes = nextValue;
				break;
			}
			else if (currentMinutes > currentValue && currentMinutes > nextValue && iMinutes === defaultMinutes.length-1) {
				// The next possible values is in the next hour, so change the hours
				currentMinutes = nextValue;
				currentHours += 1;
				break;
			}
		}

		*/

		setHours(currentHours);
		setMinutes(currentMinutes);
		setMonth(currentMonth);
		setYear(currentYear);
		setDate(currentDate);
		setAmPm(currentAmPm);
	};

	var getTimestamp = function() {
		return values.date.getTime();
	};

	/*****************************************************************************
	 * A lot of actions here (used when event is triggered)
	 ****************************************************************************/

	/**
	 * Update the value of the input slider
	 * @param  {string} reference id to the specific element
	 * @param  {integer} newValue  
	 */
	var updateInputSlider = function(reference, newValue, preventAnimation) {
		var element = byId(reference);
		preventAnimation = preventAnimation || false;

		// Find the specific value
		var divValues = qSelect(element, '.mtr-content'),
				divValue = qSelect(element, '.mtr-values .mtr-default-value[data-value="'+newValue+'"]'),
				divArrow = qSelect(element, '.mtr-arrow.up'),
				inputValue = qSelect(element, '.mtr-input');

				scrollTo = getRelativeOffset(divValues, divValue) + divArrow.clientHeight;

		inputValue.value = newValue;
		inputValue.setAttribute('data-old-value', newValue);

		if (config.animations === false || preventAnimation) {
			divValue.scrollIntoView();
		}
		else {
			smooth_scroll_to(divValues, scrollTo, config.transitionDelay);
		}
	};

	/**
	 * Add a error clas to the current input slider when a validation has failed
	 * @param  {String} reference id to the specific element
	 */
	var showInputSliderError = function(reference) {
		var element = byId(reference);
		var divContent = qSelect(element, '.mtr-content');
		addClass(divContent, 'mtr-error');

		setTimeout(function() {
			removeClass(divContent, 'mtr-error');
		}, config.transitionValidationDelay + 300);
	};

	var showInputRadioError = function(reference, value) {
		if (typeof value === 'boolean') {
            value = value === true ? 1 : 0;
        }

		var element = byId(reference);
		var divContent = qSelect(element, '.mtr-input[value="'+value+'"]');
		addClass(divContent, 'mtr-error');

		setTimeout(function() {
			removeClass(divContent, 'mtr-error');
		}, config.transitionValidationDelay + 300);
	};

	var executeChangeEvents = function(target, changeEvent, newValue, oldValue) {

		var callbackFunction = function(callback) {
			callback(target, newValue, oldValue);
		};

		events[changeEvent][target].forEach(function(callback) {
			callbackFunction(callback);
		});

		events[changeEvent].all.forEach(function(callback) {
			callbackFunction(callback);
		});

		switch (target) {
			case 'hour': 
			case 'minute':
			case 'ampm': 
				events[changeEvent].time.forEach(function(callback) {
					callbackFunction(callback);
				});			
				break;
			case 'day': 
			case 'month':
			case 'year': 
				events[changeEvent].date.forEach(function(callback) {
					callbackFunction(callback);
				});			
				break;
		}

	};

	/*****************************************************************************
	 * Some Aliases
	 ****************************************************************************/
	
	function byId(selector) {
		return document.getElementById(selector);
	}

	function qSelect(element, selector) {
		return element.querySelector(selector);
	}

	function getRelativeOffset(parent, child) {
		if (parent && child) {
		 	return child.offsetTop - parent.offsetTop;
		}
		return 0;
	}

	/**
	 * A simple function which makes a clone of a specific JS Object
	 * @param  {Object} obj 
	 * @return {Object}
	 */
	function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
	}

	/**
	 * A simple shortcut function to add a class to specific element
	 * @param {HTMLElement} element
	 * @param {string} className
	 */
	function addClass(element, className) {
		if (!element) {
			return;
		}

	  if (element.className.indexOf(className) > -1) {
	    return;
	  }

	  element.className += ' ' + className;
	}

	/**
	 * Short allias for a function which is removing a class name from a specific element
	 * @param {HtmlElement} element
	 * @param {string} className
	 */
	function removeClass(element, className) {
	  if (!element) {
			return;
		}

	  if (element.className.indexOf(className) === -1) {
	    return;
	  }

	  element.className = element.className.replace(new RegExp(className, 'g'), '');
	}

	/**
	 * Create array of values for a specific range with a givvent step
	 * @param  {object} settings 
	 * @return {array}          
	 */
	function createRange(settings) {
		var from = settings.min,
				to = settings.max,
				step = settings.step,
				range = [];

		for (var i=from; i<=to; i+=step) {
			range.push(i);
		}

		return range;
	}

	/**
	 * Create a special range with dates for a specific month
	 */
	function createRangeForDate(month, year) {
		var firstDay = new Date(year, month, 1);
		var lastDay = new Date(year, month + 1, 0);

		var range = {
			values: [],
			names: [],
			min: firstDay.getDate(),
			max: lastDay.getDate(),
			step: 1
		};

		var currentDate;
		for (var i=firstDay.getDate(); i<=lastDay.getDate(); i++) {
			currentDate = new Date(year, month, i);

			range.values.push(i);
			range.names[i] = config.daysNames[currentDate.getDay()];
		}

		return range;
	}

	/**
    Smoothly scroll element to the given target (element.scrollTop)
    for the given duration

    Returns a promise that's fulfilled when done, or rejected if
    interrupted
 	*/
	var smooth_scroll_to = function(element, target, duration) {
    target = Math.round(target);
    duration = Math.round(duration);
    if (duration < 0) {
      return;
    }
    if (duration === 0) {
      element.scrollTop = target;
      return;
    }

    var start_time = Date.now();
    var end_time = start_time + duration;

    var start_top = element.scrollTop;
    var distance = target - start_top;

    // https://coderwall.com/p/hujlhg/smooth-scrolling-without-jquery
    // based on http://en.wikipedia.org/wiki/Smoothstep
    var smooth_step = function(start, end, point) {
      if(point <= start) { return 0; }
      if(point >= end) { return 1; }
      var x = (point - start) / (end - start); // interpolation
      return x*x*(3 - 2*x);
    };

    // This is to keep track of where the element's scrollTop is
    // supposed to be, based on what we're doing
    var previous_top = element.scrollTop;

    // This is like a think function from a game loop
    var scroll_frame = function() {
      if(element.scrollTop != previous_top) {
        //reject("interrupted");
        return;
      }

      // set the scrollTop for this frame
      var now = Date.now();
      var point = smooth_step(start_time, end_time, now);
      var frameTop = Math.round(start_top + (distance * point));
      element.scrollTop = frameTop;

      // check if we're done!
      if(now >= end_time) {
        return;
      }

      // If we were supposed to scroll but didn't, then we
      // probably hit the limit, so consider it done; not
      // interrupted.
      if(element.scrollTop === previous_top && element.scrollTop !== frameTop) {
        return;
      }
      previous_top = element.scrollTop;

      // schedule next frame for execution
      setTimeout(function() {
        scroll_frame();
      }, 0);
    };

    // boostrap the animation process
    setTimeout(function() {
      scroll_frame();
    }, 0);
  };

  /**
   * Round up a timestamp to the closest monutes (11:35 to 11:40)
   * @param  {Number} timestamp
   * @return {Number}
   */
  var roundUpTimestamp = function(timestamp) {
   var border = 10 * 60 * 1000; // 10 minutes
   var delta = (border - (timestamp % border)) % timestamp;
   return (timestamp + delta);
	}

	/*****************************************************************************
	 * PUBLIC API
	 *
	 * Getters
	 ****************************************************************************/

	// Here is a set of the default Date function
	// We are providing them because the user are familiar with them and
	// maybe this way they will implemet this library easily in their system

	// "Wed Sep 23 2015"
	var toDateString = function() {
		return values.date.toDateString();
	};

	// "Wed, 23 Sep 2015 08:43:47 GMT"
	var toGMTString = function() {
		return values.date.toGMTString();
	};

	// "2015-09-23T08:43:47.284Z"
	var toISOString = function() {
		return values.date.toISOString();
	};

	// "9/23/2015"
	var toLocaleDateString = function() {
		return values.date.toLocaleDateString();
	};

	// "9/23/2015, 11:43:47 AM"
	var toLocaleString = function() {
		return values.date.toLocaleString();
	};

	// "11:43:47 AM"
	var toLocaleTimeString = function() {
		return values.date.toLocaleTimeString();
	};

	// "Wed Sep 23 2015 11:43:47 GMT+0300 (EEST)"
	var toString = function() {
		return values.date.toString();
	};

	// 11:43:47 GMT+0300 (EEST)"
	var toTimeString = function() {
		return values.date.toTimeString();
	};

	// "Wed, 23 Sep 2015 08:43:47 GMT"
	var toUTCString = function() {
		return values.date.toUTCString();
	};

	/**
	 * Return datetime in specific format
	 * @param  {String} input [description]
	 * @return {String}       [description]
	 *
	 * M
	 * MMM
	 * D
	 * Y
	 * YY
	 * YYYY
	 *
	 * h
	 * hh
	 * m
	 * mm
	 * a
	 */
	var format = function(input) {
		var currentHours = getHours();
		var currentMinutes = getMinutes();
		var currentAmPm = getIsAm();
		
		var currentDate = getDate();
		var currentMonth = getMonth() + 1;
		var currentYear = getYear();		

		// Dates
		input = specialReplace(input, 'DD', prependZero(currentDate));
		input = specialReplace(input, 'D', currentDate);

		// Years
		input = specialReplace(input, 'YYYY', currentYear);
		input = specialReplace(input, 'YY', currentYear.toString().substr(2));
		input = specialReplace(input, 'Y', currentYear);

		// Hours
		input = specialReplace(input, 'HH', prependZero(transformAmPm(currentHours, currentAmPm)));
		input = specialReplace(input, 'hh', prependZero(currentHours));
		input = specialReplace(input, 'H', transformAmPm(currentHours, currentAmPm));
		input = specialReplace(input, 'h', currentHours);

		// Minutes
		input = specialReplace(input, 'mm', prependZero(currentMinutes));
		input = specialReplace(input, 'm', getMinutes());
		
		// Am Pm
		input = specialReplace(input, 'a', currentAmPm ? 'am' : 'pm');
		input = specialReplace(input, 'A', currentAmPm ? 'AM' : 'PM');

		// Months
		input = specialReplace(input, 'MMM', config.monthsNames[currentMonth-1]);
		input = specialReplace(input, 'MM', prependZero(currentMonth));
		input = specialReplace(input, 'M', currentMonth);

		input = input.split('#%#').join('');

		function specialReplace(input, selector, value) {
			var specialDelimiter = '#%#';
			var regex = new RegExp(selector+'(?!'+specialDelimiter+')', 'g');
			input = input.replace(regex, value + specialDelimiter);
			return input;
		}

		function prependZero(value) {
			return value <= 9 ? ('0'+value) : value;
		}

		function transformAmPm(hours, ampm) {
			if (hours === 12) {
				return ampm ? 0 : 12;
			}
			return ampm ? hours : hours + 12;
		}

		return input;
	};

	/*****************************************************************************
	 * PUBLIC API
	 *
	 * Events
	 ****************************************************************************/

	var onChange = function(target, callback) {
		events.onChange[target].push(callback);
	};

	var beforeChange = function(target, callback) {
		events.beforeChange[target].push(callback);
	};

	var afterChange = function(target, callback) {
		events.afterChange[target].push(callback);
	};

	function detectBrowser() {
		var browser = {
			isChrome: false,
			isSafari: false,
			isFirefox: false,
		};

		if (navigator.userAgent.search("Safari") >= 0 && navigator.userAgent.search("Chrome") < 0) {
   		browser.isSafari = true;
		}

		return browser;
	}

		/**
	 * Public API here
	 */

	this.init = init;
	this.setConfig = setConfig;
	
	// Closing these interfaces, use format, instead of them
	// this.getHours = getHours;
	// this.getMinutes = getMinutes;
	// this.getIsAm = getIsAm;
	// this.getIsPm = getIsPm;
	// this.getTime = getTime;
	// this.getDate = getDate;
	// this.getMonth = getMonth;
	// this.getYear = getYear;
	this.getFullTime = getFullTime;
	this.getTimestamp = getTimestamp;

	this.setHours = setHours;
	this.setMinutes = setMinutes;
	this.setAmPm = setAmPm;
	this.setDate = setDate;
	this.setMonth = setMonth;
	this.setYear = setYear;
	this.setTimestamp = setTimestamp;

	this.values = values;

	// Here is the set with the default Date getters
	this.toDateString = toDateString;
	this.toGMTString = toGMTString;
	this.toISOString = toISOString;
	this.toLocaleDateString = toLocaleDateString;
	this.toLocaleString = toLocaleString;
	this.toLocaleTimeString = toLocaleTimeString;
	this.toString = toString;
	this.toTimeString = toTimeString;
	this.toUTCString = toUTCString;
	this.format = format;

	// Here are some events which the api provides
	this.onChange = onChange;
	this.beforeChange = beforeChange;
	this.afterChange = afterChange;

	// Lets init all
	init(inputConfig);

}
