/*
 * ResBeautifier
 * https://github.com/wisehermit/resBeautifier
 */

function ResBeautifier() {

    this.resources = {};
    this.resources_max = 0;

    this.styles = [
        '.resBeautifier { height:20px; margin-bottom:1px; border-bottom:1px #bbb solid; }',
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

        // Создаем основной враппер
        var wrapper = this.createElement('div', {
            'id': 'resBeautifier',
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

        $(wrapper).append(storemaxLink)
                  .insertAfter('.extop');

        // @TODO: Add resources

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
