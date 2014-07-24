/*
 * ResBeautifier
 * https://github.com/wisehermit/resBeautifier
 */

function ResBeautifier() {

    this.resources = {};
    this.resources_max = 0;

    this.dotImg = 'http://w20.wofh.ru/p/_.gif'; // @TODO: change to relative link
    this.styles = [
        '.resBeautifier { height:20px; margin-bottom:1px; border-bottom:1px #bbb solid; }',
        '.resBeautifier  div { float:left; overflow:visible; line-height:20px; width:50px; }',
        '.resBeautifier .progressbar { float:none; height:20px; border-bottom:2px #99f solid; width:0px; }',
        '#resBeautifier .storemax { display:block; color:#000; font-weight:bold; text-align:center; padding-bottom:10px; width:100%; }'
    ];


    this.initialize = function () {

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

}

var resBeautifier = new ResBeautifier();
resBeautifier.initialize();
