/*
 * This file is part of «Epigraphy of Medieval Rus» database.
 *
 * Copyright (c) National Research University Higher School of Economics
 *
 * «Epigraphy of Medieval Rus» database is free software:
 * you can redistribute it and/or modify it under the terms of the
 * GNU General Public License as published by the Free Software Foundation, version 3.
 *
 * «Epigraphy of Medieval Rus» database is distributed
 * in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even
 * the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code. If you have not received
 * a copy of the GNU General Public License along with
 * «Epigraphy of Medieval Rus» database,
 * see <http://www.gnu.org/licenses/>.
 */

import $ from 'jquery';
import 'popper.js/dist/popper.min';
import 'bootstrap';
import PhotoSwipe from 'photoswipe/dist/photoswipe';
import PhotoSwipeUI_Default from 'photoswipe/dist/photoswipe-ui-default';

$(window).on('load', () => {

    // this is an adapted copy-paste of the "Getting started" example of PhotoSwipe
    function initPhotoSwipeFromDom(gallerySelector) {

        function parseThumbnailElements(galleryElement) {

            const thumbnailElements = galleryElement.childNodes;

            const imageDataCollection = [];

            for (let i = 0; i < thumbnailElements.length; i++) {

                const figureElement = thumbnailElements[i];

                if (figureElement.nodeType !== Node.ELEMENT_NODE || figureElement.children.length < 2) {
                    continue;
                }

                const aElement = figureElement.children[0];

                if (figureElement.children.length === 0) {
                    continue;
                }

                const figcaptionElement = figureElement.children[1];
                const imgElement = aElement.children[0];

                const item = {
                    src: aElement.getAttribute('href'),
                    downloadUrl: figureElement.getAttribute('data-download-url'),
                    title: figcaptionElement.innerHTML,
                    msrc: imgElement.getAttribute('src'),
                    w: imgElement.naturalWidth,
                    h: imgElement.naturalHeight,
                    figureElement: figureElement
                };

                imageDataCollection.push(item);
            }

            return imageDataCollection;
        }

        function closest(element, callback) {
            return element && (callback(element) ? element : closest(element.parentNode, callback));
        }

        function onThumbnailsClick(event) {

            event = event || window.event;

            event.preventDefault ? event.preventDefault() : event.returnValue = false;

            const eventTarget = event.target || event.srcElement;

            const clickedListItem = closest(eventTarget, (element) => {
                return (element.tagName && element.tagName.toUpperCase() === 'FIGURE');
            });

            if (!clickedListItem) {
                return;
            }

            const clickedGallery = clickedListItem.parentNode;
            const childNodes = clickedListItem.parentNode.childNodes;
            const numChildNodes = childNodes.length;

            let index;
            let nodeIndex = 0;

            for (let i = 0; i < numChildNodes; i++) {

                if (childNodes[i].nodeType !== Node.ELEMENT_NODE) {
                    continue;
                }

                if (childNodes[i] === clickedListItem) {
                    index = nodeIndex;
                    break;
                }

                nodeIndex++;
            }

            if (index >= 0) {
                openPhotoSwipe(index, clickedGallery);
            }

            return false;
        }

        function parseGalleryDataFromUrl() {

            const hash = window.location.hash.substring(1);
            const params = {};

            if (hash.length < 5) {
                return params;
            }

            const vars = hash.split('&');

            for (let i = 0; i < vars.length; i++) {

                if (!vars[i]) {
                    continue;
                }

                const pair = vars[i].split('=');

                if (pair.length < 2) {
                    continue;
                }

                params[pair[0]] = pair[1];
            }

            if (params.gid) {
                params.gid = parseInt(params.gid, 10);
            }

            return params;
        }

        function openPhotoSwipe(index, galleryElement, disableAnimation, fromURL) {

            const pswpElement = document.querySelectorAll('.pswp')[0];

            const items = parseThumbnailElements(galleryElement);

            const options = {
                galleryUID: galleryElement.getAttribute('data-pswp-uid'),
                getThumbBoundsFn: (index) => {
                    const thumbnailElement = items[index].figureElement.getElementsByTagName('img')[0];

                    const pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
                    const rect = thumbnailElement.getBoundingClientRect();

                    return {x: rect.left, y: rect.top + pageYScroll, w: rect.width};
                },
                shareButtons: [
                    {id: 'download', label: 'Download', url: '{{raw_image_url}}', download: true},
                    {
                        id: 'facebook',
                        label: 'Share on Facebook',
                        url: 'https://www.facebook.com/sharer/sharer.php?u={{url}}'
                    },
                ],
                getImageURLForShare: (shareButtonData) => {
                    return gallery.currItem.downloadUrl;
                },
                closeOnScroll: false,
                pinchToClose: false,
                tapToClose: false,
                closeElClasses: [],
                clickToCloseNonZoomable: false,
            };

            if (fromURL) {
                if (options.galleryPIDs) {
                    for (let j = 0; j < items.length; j++) {
                        if (items[j].pid == index) {
                            options.index = j;
                            break;
                        }
                    }
                } else {
                    options.index = parseInt(index, 10) - 1;
                }
            } else {
                options.index = parseInt(index, 10);
            }

            if (isNaN(options.index)) {
                return;
            }

            if (disableAnimation) {
                options.showAnimationDuration = 0;
            }

            const gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
            gallery.init();
        }

        const galleryElements = document.querySelectorAll(gallerySelector);

        for (let i = 0, l = galleryElements.length; i < l; i++) {
            galleryElements[i].setAttribute('data-pswp-uid', i + 1);
            galleryElements[i].onclick = onThumbnailsClick;
        }

        const urlData = parseGalleryDataFromUrl();
        if (urlData.pid && urlData.gid) {
            openPhotoSwipe(urlData.pid, galleryElements[urlData.gid - 1], true, true);
        }
    }

    initPhotoSwipeFromDom('[data-images-container]');
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })
    
    // Initialize EpiDoc Viewer
    initEpidocViewer();
});

/**
 * EpiDoc XML Viewer
 * Parses and renders EpiDoc XML with syntax highlighting and structured view
 */
function initEpidocViewer() {
    const dataScript = document.getElementById('epidoc-data');
    if (!dataScript) return;
    
    const xmlString = dataScript.textContent;
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
        console.error('EpiDoc XML parsing error:', parseError.textContent);
        return;
    }
    
    // Render both views
    renderRenderedView(xmlDoc);
    renderSourceView(xmlString);
    
    // Setup tab switching
    setupTabs();
    
    // Setup copy button
    setupCopyButton(xmlString);
}

/**
 * Render the structured/formatted view of the EpiDoc
 */
function renderRenderedView(xmlDoc) {
    const container = document.getElementById('epidoc-rendered');
    if (!container) return;
    
    // Parse bibliography map
    const bibliographyMap = parseBibliography(xmlDoc);
    
    // Initial bracket system (default: Leiden = false in toggle)
    let currentSystem = 'leiden';

    function renderContent() {
        let html = '';
        
        // Header/Metadata section - disabled
        // const teiHeader = xmlDoc.querySelector('teiHeader');
        // if (teiHeader) {
        //     html += renderHeaderSection(teiHeader);
        // }
        
        // Text body sections
        const textBody = xmlDoc.querySelector('text > body');
        if (textBody) {
            // Edition (main text)
            const edition = textBody.querySelector('div[type="edition"]');
            if (edition) {
                html += renderEditionSection(edition, currentSystem);
            }
            
            // Critical Apparatus - collect all <app> elements from edition
            if (edition) {
                const appElements = edition.querySelectorAll('app');
                if (appElements.length > 0) {
                    html += renderCriticalApparatusTable(appElements, bibliographyMap, currentSystem);
                }
            }
    
            // Translations
            const translations = textBody.querySelectorAll('div[type="translation"]');
            if (translations.length > 0) {
                html += renderTranslationsSection(translations, bibliographyMap);
            }
        }
        
        container.innerHTML = html;
        
        // Re-attach event listener to toggle after re-rendering
        const toggle = document.querySelector('.epidoc-toggle-input');
        if (toggle) {
            toggle.checked = currentSystem === 'zaliznyak';
            toggle.addEventListener('change', (e) => {
                currentSystem = e.target.checked ? 'zaliznyak' : 'leiden';
                renderContent();
            });
        }
    }
    
    // Initial render
    renderContent();
}

/**
 * Render header/metadata section
 */
function renderHeaderSection(teiHeader) {
    const title = getTextContent(teiHeader, 'titleStmt > title');
    const repository = getTextContent(teiHeader, 'repository');
    const idno = getTextContent(teiHeader, 'msIdentifier > idno');
    const origPlace = getTextContent(teiHeader, 'origPlace');
    const origDate = getTextContent(teiHeader, 'origDate');
    const provenance = getTextContent(teiHeader, 'provenance[type="found"]');
    const genre = getTextContent(teiHeader, 'keywords[scheme="#genre"] > term');
    const technique = getTextContent(teiHeader, 'keywords[scheme="#technique"] > term');
    const preservation = getTextContent(teiHeader, 'keywords[scheme="#preservation"] > term');
    
    let metaItems = '';
    
    if (title) metaItems += createMetaItem('Title', title);
    if (repository) metaItems += createMetaItem('Repository', repository);
    if (idno) metaItems += createMetaItem('Inventory №', idno);
    if (origPlace) metaItems += createMetaItem('Origin', origPlace);
    if (origDate) metaItems += createMetaItem('Date', origDate);
    if (genre) metaItems += createMetaItem('Genre', genre);
    if (technique) metaItems += createMetaItem('Technique', technique);
    if (preservation) metaItems += createMetaItem('Preservation', preservation);
    
    let html = `
        <div class="epidoc-section epidoc-section--header">
            <h4 class="epidoc-section-title">📋 Metadata</h4>
            <div class="epidoc-metadata-grid">
                ${metaItems}
            </div>`;
    
    if (provenance) {
        html += `
            <div style="margin-top: 1rem;">
                <span class="epidoc-meta-label">Provenance</span>
                <p style="margin: 0.5rem 0 0 0; color: #c9d1d9;">${escapeHtml(provenance.trim())}</p>
            </div>`;
    }
    
    html += '</div>';
    return html;
}

function createMetaItem(label, value) {
    return `
        <div class="epidoc-metadata-item">
            <span class="epidoc-meta-label">${label}</span>
            <span class="epidoc-meta-value">${escapeHtml(value.trim())}</span>
        </div>`;
}

/**
 * Render the edition (main text) section
 */
function renderEditionSection(edition, system = 'leiden') {
    let textContent = renderEditionContent(edition, system);
    // Clean up: trim and collapse multiple spaces
    textContent = textContent.trim().replace(/\s+/g, ' ');
    
    return `
        <div class="epidoc-section epidoc-section--edition">
            <div class="epidoc-section-header">
                <h4 class="epidoc-section-title">Текст</h4>
                <div class="epidoc-toggle-wrapper">
                    <span class="epidoc-toggle-label epidoc-toggle-label--left">Лейденская система</span>
                    <label class="epidoc-toggle">
                        <input type="checkbox" class="epidoc-toggle-input" ${system === 'zaliznyak' ? 'checked' : ''} />
                        <span class="epidoc-toggle-slider"></span>
                    </label>
                    <span class="epidoc-toggle-label epidoc-toggle-label--right">Система Зализняка</span>
                </div>
            </div>
            <div class="epidoc-edition-text">${textContent}</div>
        </div>`;
}

/**
 * Bracket Systems Configuration
 */
const BRACKET_SYSTEMS = {
    leiden: {
        supplied: {
            editorial: ['⟨', '⟩'],
            lost: ['[', ']']
        }
    },
    zaliznyak: {
        supplied: {
            editorial: ['[', ']'],
            lost: ['(', ')']
        }
    }
};

/**
 * Recursively render edition content with proper markup
 */
function renderEditionContent(node, system = 'leiden') {
    let result = '';
    
    for (const child of node.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
            // Normalize whitespace: collapse multiple spaces/newlines into single space
            const text = child.textContent.replace(/\s+/g, ' ');
            result += escapeHtml(text);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
            const tagName = child.localName;
            
            switch (tagName) {
                case 'supplied':
                    const reason = child.getAttribute('reason') || 'lost';
                    // For HTML rendering (edition text), we use data attributes and CSS/JS to handle display
                    // But brackets might be part of content for simple text extraction
                    const suppliedClass = reason === 'editorial' 
                        ? 'epidoc-supplied epidoc-supplied--editorial' 
                        : 'epidoc-supplied';
                    
                    // Get bracket chars based on system
                    const brackets = BRACKET_SYSTEMS[system].supplied[reason] || BRACKET_SYSTEMS[system].supplied.lost;
                    
                    result += `<span class="${suppliedClass}" title="Supplied: ${reason}" data-brackets-start="${brackets[0]}" data-brackets-end="${brackets[1]}">${brackets[0]}${renderEditionContent(child, system)}${brackets[1]}</span>`;
                    break;
                    
                case 'app':
                    result += renderApparatus(child, system);
                    break;
                    
                case 'ab':
                case 'p':
                    result += renderEditionContent(child, system);
                    break;
                    
                case 'lb':
                    const lineNum = child.getAttribute('n');
                    if (lineNum) {
                        result += `<span class="epidoc-line-number" title="Line ${lineNum}">${lineNum}</span> `;
                    }
                    result += '\n';
                    break;
                    
                case 'gap':
                    const extent = child.getAttribute('extent') || '?';
                    result += `<span class="epidoc-gap" title="Gap: ${extent}">[...]</span>`;
                    break;
                    
                case 'unclear':
                    result += `<span class="epidoc-unclear" title="Unclear reading">${renderEditionContent(child, system)}</span>`;
                    break;
                    
                case 'lem':
                case 'rdg':
                    // These are handled by renderApparatus, skip here
                    result += renderEditionContent(child, system);
                    break;
                    
                default:
                    result += renderEditionContent(child, system);
            }
        }
    }
    
    return result;
}

/**
 * Render apparatus entry with lemma and readings
 */
function renderApparatus(appNode, system) {
    const lem = appNode.querySelector('lem');
    const readings = appNode.querySelectorAll('rdg');
    
    let lemContent = lem ? renderEditionContent(lem, system) : '';
    let lemResp = lem ? (lem.getAttribute('resp') || '') : '';
    
    let readingsHtml = '';
    readings.forEach(rdg => {
        const resp = rdg.getAttribute('resp') || '';
        const respLabel = resp ? `<span class="epidoc-resp">${resp}</span>` : '';
        readingsHtml += `<span class="epidoc-rdg">${renderEditionContent(rdg, system)} ${respLabel}</span>`;
    });
    
    return `<span class="epidoc-app">
        <span class="epidoc-lem" title="Click to see variant readings">${lemContent}</span>
        <span class="epidoc-readings">${readingsHtml}</span>
    </span>`;
}

/**
 * Render translations section
 */
function renderTranslationsSection(translations, bibliographyMap) {
    let items = '';
    
    translations.forEach(trans => {
        const lang = trans.getAttribute('xml:lang') || 'unknown';
        const resp = trans.getAttribute('resp') || '';
        const text = trans.textContent.trim();
        
        const langBadge = `<span class="epidoc-lang-badge">${lang}</span>`;
        
        const resolvedResp = resolveResp(resp, bibliographyMap);
        const respBadge = resolvedResp ? `<span class="epidoc-resp-badge">${escapeHtml(resolvedResp)}</span>` : '';
        
        items += `
            <div class="epidoc-translation-line">
                <span class="epidoc-translation-text">${escapeHtml(text)}</span>
                ${respBadge}${langBadge}
            </div>`;
    });
    
    return `
        <div class="epidoc-section epidoc-section--translation">
            <h4 class="epidoc-section-title">Переводы</h4>
            <div class="epidoc-translations-block">
                ${items}
            </div>
        </div>`;
}

/**
 * Render critical apparatus as a table
 */
function renderCriticalApparatusTable(appElements, bibliographyMap, system) {
    let rows = '';
    
    appElements.forEach((app, index) => {
        const lem = app.querySelector('lem');
        const readings = app.querySelectorAll('rdg');
        
        // Get lemma text and resp
        let lemText = lem ? getPlainText(lem, system) : '';
        // let lemResp = lem ? (lem.getAttribute('resp') || '') : '';
        
        // Build alternative readings
        let alternatives = [];
        readings.forEach(rdg => {
            const rdgText = getPlainText(rdg, system);
            const rdgResp = rdg.getAttribute('resp') || '';
            alternatives.push({
                text: rdgText,
                resp: rdgResp
            });
        });
        
        // Create row
        const lemDisplay = escapeHtml(lemText);
        
        const altDisplay = alternatives.map(alt => {
            const resolvedResp = resolveResp(alt.resp, bibliographyMap);
            const respTag = resolvedResp ? ` <span class="apparatus-resp">${escapeHtml(resolvedResp)}</span>` : '';
            return `${escapeHtml(alt.text)}${respTag}`;
        }).join('<br>');
        
        rows += `
            <tr>
                <td class="apparatus-lem-cell">${lemDisplay}</td>
                <td class="apparatus-rdg-cell">${altDisplay}</td>
            </tr>`;
    });
    
    return `
        <div class="epidoc-section epidoc-section--apparatus">
            <h4 class="epidoc-section-title">Критический аппарат</h4>
            <table class="apparatus-table">
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>`;
}

/**
 * Get plain text content from an element (recursively, handling supplied elements)
 */
function getPlainText(node, system = 'leiden') {
    let result = '';
    
    for (const child of node.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
            result += child.textContent.replace(/\s+/g, ' ');
        } else if (child.nodeType === Node.ELEMENT_NODE) {
            const tagName = child.localName;
            
            if (tagName === 'supplied') {
                const reason = child.getAttribute('reason') || 'lost';
                const brackets = BRACKET_SYSTEMS[system].supplied[reason] || BRACKET_SYSTEMS[system].supplied.lost;
                result += brackets[0] + getPlainText(child, system) + brackets[1];
            } else {
                result += getPlainText(child, system);
            }
        }
    }
    
    return result.trim();
}

/**
 * Render a simple section (apparatus, commentary, bibliography)
 */
function renderSimpleSection(element, type, title) {
    const iconMap = {
        'apparatus': '📝',
        'commentary': '💬',
        'bibliography': '📚'
    };
    const icon = iconMap[type] || '📄';
    const content = element.textContent.trim();
    
    return `
        <div class="epidoc-section epidoc-section--${type}">
            <h4 class="epidoc-section-title">${icon} ${title}</h4>
            <p style="margin: 0; color: #212529;">${escapeHtml(content)}</p>
        </div>`;
}

/**
 * Render XML source with syntax highlighting
 */
function renderSourceView(xmlString) {
    const container = document.getElementById('epidoc-source');
    if (!container) return;
    
    // Apply syntax highlighting
    const highlighted = highlightXml(xmlString.trim());
    container.innerHTML = highlighted;
}

/**
 * Simple XML syntax highlighter
 */
function highlightXml(xml) {
    // Escape HTML first
    let result = escapeHtml(xml);
    
    // Highlight XML declarations
    result = result.replace(/(&lt;\?[\s\S]*?\?&gt;)/g, '<span class="xml-declaration">$1</span>');
    
    // Highlight comments
    result = result.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="xml-comment">$1</span>');
    
    // Highlight tags with attributes
    result = result.replace(/(&lt;\/?)(\w+[\w:-]*)((?:\s+[\w:-]+\s*=\s*&quot;[^&]*&quot;)*\s*)(\/?)(&gt;)/g, 
        (match, open, tagName, attrs, selfClose, close) => {
            // Highlight attributes
            const highlightedAttrs = attrs.replace(/([\w:-]+)(\s*=\s*)(&quot;)([^&]*)(&quot;)/g, 
                '<span class="xml-attr-name">$1</span>$2<span class="xml-attr-value">$3$4$5</span>');
            return `${open}<span class="xml-tag">${tagName}</span>${highlightedAttrs}${selfClose}${close}`;
        });
    
    return result;
}

/**
 * Setup tab switching functionality
 */
function setupTabs() {
    const tabs = document.querySelectorAll('.epidoc-tab');
    const contents = document.querySelectorAll('.epidoc-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            
            // Update tab states
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update content visibility
            contents.forEach(content => {
                content.classList.toggle('active', content.getAttribute('data-content') === targetTab);
            });
        });
    });
}

/**
 * Setup copy to clipboard functionality
 */
function setupCopyButton(xmlString) {
    const copyBtn = document.querySelector('.epidoc-copy-btn');
    if (!copyBtn) return;
    
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(xmlString.trim());
            copyBtn.classList.add('copied');
            copyBtn.innerHTML = '<span class="copy-icon">✓</span> Copied!';
            
            setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyBtn.innerHTML = '<span class="copy-icon">📋</span> Copy';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    });
}

/**
 * Parse bibliography for resolving references
 */
function parseBibliography(xmlDoc) {
    const map = new Map();
    // Use getElementsByTagName to avoid namespace issues that can occur with querySelector in some XML parsers
    const bibls = xmlDoc.getElementsByTagName('bibl');
    
    for (let i = 0; i < bibls.length; i++) {
        const bibl = bibls[i];
        const id = bibl.getAttribute('xml:id') || bibl.getAttribute('id');
        if (id) {
            map.set(id, bibl.textContent.trim());
        }
    }
    return map;
}

/**
 * Resolve response/responsibility ID to bibliography name if available
 */
function resolveResp(resp, bibliographyMap) {
    if (!resp) return '';
    const id = resp.replace(/^#/, '');
    if (bibliographyMap && bibliographyMap.has(id)) {
        return bibliographyMap.get(id);
    }
    return resp;
}

/**
 * Utility: Get text content from a selector
 */
function getTextContent(parent, selector) {
    const element = parent.querySelector(selector);
    return element ? element.textContent : '';
}

/**
 * Utility: Escape HTML entities
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}