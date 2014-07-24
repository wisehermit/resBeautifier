/*
 * ResBeautifier
 * https://github.com/wisehermit/resBeautifier
 */

function ResBeautifier() {

    this.resources = {};
    this.resources_max = 0;
    
    this.timeoutHandler;
    this.offsetTime = 0;

    this.dotImg = 'http://w20.wofh.ru/p/_.gif'; // @TODO: change to relative link
    this.styles = [
        '.resBeautifier { height:20px; margin-bottom:1px; border-bottom:1px #bbb solid; }',
        '.resBeautifier  div { float:left; overflow:visible; line-height:20px; width:50px; }',
        '.resBeautifier .progressbar { float:none; height:20px; border-bottom:2px #99f solid; width:0px; }',
        '#resBeautifier .storemax { display:block; color:#000; font-weight:bold; text-align:center; padding-bottom:10px; width:100%; }'
    ];


    this.initialize = function () {
        
        // Разница во времени между сервером и клиентом
        this.offsetTime = wofh.time - this.getTimestamp();

        // Проверяем наличие правой колонки на текущей странице
        if ($('.chcol1.chcol_p1').length <= 0) {
            return false;
        }

        // Текущая вместимость склада
        this.resources_max = wofh.town.resources.max;

        // Создаем новый объект со всеми интересующими нас ресурсами
        for (resId in wofh.town.resources.current) {

            this.resources[resId] = {
                name:    lib.resource.data[resId].name,
                current: wofh.town.resources.current[resId],
                alter:   wofh.town.resources.alter[resId],

                // initial value
                initial: wofh.town.resources.current[resId]
            };

        }

        // Создаем основной враппер и заполняем его ресурсами
        this.buildResourceBlock();
        
        // Запускаем ежесекундную обработку всех пераметров
        this.handling();

    }


    this.buildResourceBlock = function () {

        // Добавляем на страницу встроенные стили
        this.createStyleSheets();

        // Для поддержки повторной инициализации
        $('#resBeautifier').remove();

        // Создаем основной враппер
        var resBeautifierWrapper = this.createElement('div', {
            'id':    'resBeautifier',
            'class': 'chcol1 chcol_p1',
            'style': 'display:block;'
        });

        // Добавляем стандартный блок с информацией о вместимости склада
        var storemaxLink = this.createElement('a', {
            'class': 'storemax'
        });
        storemaxLink.innerHTML = 'Вместимость хранилища: ';

        var storemaxSpan = this.createElement('span', {
            'id': 'storemax'
        });
        storemaxSpan.innerHTML = this.resources_max;

        $(storemaxLink).append(storemaxSpan);

        $(resBeautifierWrapper).append(storemaxLink)
                               .insertAfter('.extop');


        // Добавляем ресурсы
        for (resId in this.resources) {

            // one more wrapper. this is madness.
            var wrapper = this.createElement('span', {
                'class': 'resBeautifier'
            });


            var iconImg = this.createElement('img', {
                'src':   this.dotImg,
                'class': 'res r' + resId,
                'title': this.resources[resId]['name']
            });

            var currentSpan = this.createElement('span', {
                'id': 'rbCurrent' + resId
            });
            currentSpan.innerHTML = Math.floor(this.resources[resId]['current']);

            var iconDiv = this.createElement('div', {
                'style': 'width:75px'
            });

            $(iconDiv).append(iconImg)
                      .append(currentSpan);

            $(wrapper).append(iconDiv);


            var alterDiv = this.createElement('div', {
                'id': 'rbAlter' + resId
            });
            alterDiv.innerHTML = this.resources[resId]['alter'].toFixed(2);

            $(wrapper).append(alterDiv);


            var percentDiv = this.createElement('div', {
                'id': 'rbPercent' + resId
            });
            percentDiv.innerHTML = '&nbsp;';

            $(wrapper).append(percentDiv);


            var timeleftDiv = this.createElement('div', {
                'id':    'rbTimeleft' + resId,
                'style': 'width:65px'
            });
            timeleftDiv.innerHTML = '&nbsp;';

            $(wrapper).append(timeleftDiv);


            var dropdownDiv = this.createElement('div', {
                'style': 'width:10px;position:relative'
            });
            dropdownDiv.innerHTML = 'V';

            // @TODO: Add dropdown event
            $(wrapper).append(dropdownDiv);


            // temp placeholder
            //$(wrapper).append(this.createElement('div', {
            //    'style': 'width:100%;float:none;clear:both'
            //}));

            var progressBarDiv = this.createElement('div', {
                'id':    'rbProgressBar' + resId,
                'class': 'progressbar'
            });

            $(wrapper).append(progressBarDiv);


            // wrapper into wrapper with wrappers...
            $(resBeautifierWrapper).append(wrapper);

        }

    }
    
    
    this.handling = function () {

        // just in case
        clearTimeout(this.timeoutHandler);

        for (resId in this.resources) {

            var elapsed = this.getTimestamp() + this.offsetTime - wofh.time;
            this.resources[resId]['current'] = this.resources[resId]['initial'] + this.resources[resId]['alter'] / 60 / 60 * elapsed;

            if (this.resources[resId]['current'] < 0) {
                this.resources[resId]['current'] = 0;
            }

            if (resId > 1 && this.resources[resId]['current'] > this.resources_max) {
                this.resources[resId]['current'] = this.resources_max;
            }

            $('#rbCurrent' + resId).html(this.resources[resId]['current'].toFixed(2));


            var percent = this.getPercent(resId);
            $('#rbPercent' + resId).html(percent + '%');


            var timeleft = this.getTimeLeft(resId);

            $('#rbTimeleft' + resId).html(timeleft)
                                    .css('color', timeleft == '00:00:00' ? '#d33' : '#000');


            $('#rbProgressBar' + resId).css('width', percent + '%');

        }

        this.timeoutHandler = setTimeout(function () {
            resBeautifier.handling()
        }, 1000);

    }


    this.getPercent = function (resId) {

        var max = this.resources_max;

        if (resId == 0) {
            max = this.resources[resId]['alter'] / Math.round(wofh.town.budget.bars[0] * 100) * 60 * 6.6667;
        }

        if (resId == 1) {
            max = Math.abs(this.resources[resId]['alter']) * 8.0000;
        }

        this.resources[resId]['percent'] = Math.floor(this.resources[resId]['current'] / (Math.round(max) / 100)); // r>f
        return this.resources[resId]['percent'];

    }


    this.getTimeLeft = function (resId) {

        if (this.resources[resId]['alter'] == 0) {
            return;
        }


        var boundary = this.resources[resId]['alter'] > 0 ? this.resources_max : 0;

        if (resId == 0) {
            var limit = this.resources[resId]['percent'] < 100 ? 6.6667 : 12;
            boundary = this.resources[resId]['alter'] / Math.round(wofh.town.budget.bars[0] * 100) * 60 * limit;
        }

        if (resId == 1 && this.resources[resId]['alter'] > 0) {
            boundary = this.resources[resId]['alter'] * 8.0000;
        }

        var seconds = (boundary - this.resources[resId]['current']) / this.resources[resId]['alter'] * 3600;

        if (seconds < 0) {
            return '00:00:00';
        }

        if (seconds > 86400 * 3) {
            return (seconds / 86400).toFixed(1) + ' дн.';
        }

        seconds = parseInt(seconds, 10);

        var h = ('0' + Math.floor(seconds / 3600)).slice(-2);
        var m = ('0' + Math.floor((seconds - (h * 3600)) / 60)).slice(-2);
        var s = ('0' + (seconds - (h * 3600) - (m * 60))).slice(-2);

        return h + ':' + m + ':' + s;

    }


    this.createElement = function (type, attributes) {

        var element = document.createElement(type);

        for (var attrName in attributes) {
            element.setAttribute(attrName, attributes[attrName]);
        }

        return element;

    }


    this.createStyleSheets = function () {

        var head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style');

        style.type = 'text/css';
        if (style.styleSheet) {
            style.styleSheet.cssText = this.styles.join('');
        } else {
            style.appendChild(document.createTextNode(this.styles.join('')));
        }

        head.appendChild(style);

    }

    
    this.getTimestamp = function () {

        return Math.floor(new Date().getTime() / 1000);

    }

    
}

var resBeautifier = new ResBeautifier();
resBeautifier.initialize();
