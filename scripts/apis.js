const API = {};

function arrayBufferToBase64(buffer) {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function createModal(html, className, onclose) {
    let modal = document.createElement('div');
    modal.classList.add('modal');
    let modal_content = document.createElement('div');
    modal_content.classList.add('modal-content');
    if(className) modal_content.classList.add(className);
    modal_content.innerHTML = html;
    modal.appendChild(modal_content);
    let close = document.createElement('span');
    close.classList.add('modal-close');
    close.innerHTML = '&times;';
    function escapeEvent(e) {
        if(document.querySelector('.viewer-in')) return;
        if(e.key === 'Escape' || (e.altKey && e.keyCode === 78)) {
            modal.remove();
            let event = new Event('findActiveTweet');
            document.dispatchEvent(event);
            document.removeEventListener('keydown', escapeEvent);
            if(onclose) onclose();
        }
    }
    close.addEventListener('click', () => {
        modal.remove();
        let event = new Event('findActiveTweet');
        document.dispatchEvent(event);
        document.removeEventListener('keydown', escapeEvent);
        if(onclose) onclose();
    });
    modal.addEventListener('click', e => {
        if(e.target === modal) {
            modal.remove();
            let event = new Event('findActiveTweet');
            document.dispatchEvent(event);
            document.removeEventListener('keydown', escapeEvent);
            if(onclose) onclose();
        }
    });
    document.addEventListener('keydown', escapeEvent);
    modal_content.appendChild(close);
    document.body.appendChild(modal);
    return modal;
}
function handleFiles(files, mediaArray, mediaContainer) {
    let images = [];
    let videos = [];
    let gifs = [];
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        if (file.type.includes('gif')) {
            // max 15 mb
            if (file.size > 15000000) {
                return alert('GIFs must be less than 15 MB');
            }
            gifs.push(file);
        } else if (file.type.includes('video')) {
            // max 500 mb
            if (file.size > 500000000) {
                return alert('Videos must be less than 500 MB');
            }
            videos.push(file);
        } else if (file.type.includes('image')) {
            // max 5 mb
            if (file.size > 5000000) {
                return alert('Images must be less than 5 MB');
            }
            images.push(file);
        }
    }
    // either up to 4 images or 1 video or 1 gif
    if (images.length > 0) {
        if (images.length > 4) {
            images = images.slice(0, 4);
        }
        if (videos.length > 0 || gifs.length > 0) {
            return alert('You can only upload up to 4 images or 1 video or 1 gif');
        }
    }
    if (videos.length > 0) {
        if (images.length > 0 || gifs.length > 0 || videos.length > 1) {
            return alert('You can only upload up to 4 images or 1 video or 1 gif');
        }
    }
    if (gifs.length > 0) {
        if (images.length > 0 || videos.length > 0 || gifs.length > 1) {
            return alert('You can only upload up to 4 images or 1 video or 1 gif');
        }
    }
    // get base64 data
    let media = [...images, ...videos, ...gifs];
    let base64Data = [];
    for (let i = 0; i < media.length; i++) {
        let file = media[i];
        let reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = () => {
            base64Data.push(reader.result);
            if (base64Data.length === media.length) {
                mediaContainer.innerHTML = '';
                while (mediaArray.length > 0) {
                    mediaArray.pop();
                }
                base64Data.forEach(data => {
                    let div = document.createElement('div');
                    let img = document.createElement('img');
                    div.title = file.name;
                    div.id = `new-tweet-media-img-${Date.now()}${Math.random()}`.replace('.', '-');
                    div.className = "new-tweet-media-img-div";
                    img.className = "new-tweet-media-img";
                    let progress = document.createElement('span');
                    progress.hidden = true;
                    progress.className = "new-tweet-media-img-progress";
                    let remove = document.createElement('span');
                    remove.className = "new-tweet-media-img-remove";
                    let alt;
                    if (!file.type.includes('video')) {
                        alt = document.createElement('span');
                        alt.className = "new-tweet-media-img-alt";
                        alt.innerText = "ALT";
                        alt.addEventListener('click', () => {
                            mediaObject.alt = prompt('Enter alt text for image');
                        });
                    }
                    let dataBase64 = arrayBufferToBase64(data);
                    let mediaObject = {
                        div, img,
                        id: img.id,
                        data: data,
                        dataBase64: dataBase64,
                        type: file.type,
                        category: file.type.includes('gif') ? 'tweet_gif' : file.type.includes('video') ? 'tweet_video' : 'tweet_image'
                    };
                    mediaArray.push(mediaObject);
                    img.src = file.type.includes('video') ? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAWUSURBVHhe7Z1pqG5THMbPNV1jul1TJEOZuqYMRZEpoRARvlw+uIjwASlRFIkMHwzJ8AVfZMhYOGRKESlDkciQyJhknj3PXu9b3nP2sPba9x3Wfp5f/dpr77p1zl7Ped+11l77f5fMz8/PGV3WGByNKA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOG3eC1gGl4ammXF+h9+HZj0xAdgC3gwPhw5AHjAAL8Kz4Re8UEVTANaCT8HDijOTGy9B9t1fxVkJTWOAneAhoWky5ADIPqykKQCbQA8U84V9xz6spKlzlwyOJl9q+9B/3eI4AOI0zQIOhs+H5iJeh3fBP4qzcjaDF8DNizPTls/gDfCH4qycDeBZcLfibDEcxL8QmotJDQA7fVf4QXFWz8nwvtA0LTkJPhCatewM34LrFGej1AYg9SvgF/hNaDby8eBo2vPp4NjEl5B90hqPAcRxAMRxAMRxAMRxAMRxAMRJDcCaA2NYe3A07Ym9d236Y4TUAGwET4VlCw//Z124MjRNAmfADUOzEnb8iZB90pouS8H/QC5A1C0FMwDcUWTS4YLbz6FZCgOwFaz6Yx7LUrDJh7EsBZue0KcA/Av/Dk0TS18CwIcm/KjbEV4Nf4Qmgr4E4ErIbdAfwUvhXvB+WLkb1gS6BICzAG5Y+KTG2EfGXVn42PRDeAo8AnLjSs5wplV2b4dy3z/7IokuATgHbtfg9vBuOA04JngOHgjPhJ/D3Lgdlt3XhV4Ek0gNAL9jH4RNg66f4J2hOTX4lgx/hj3gdbBuTj1r3At/C81KuA5zD0wa96QGgB0fO+L+c3CcNt/Bi+G+8BGYw4wh9t616Y8R+jIIbMN78AR4NHyTF5RRDADhoInvPO4Pz4NfQUlUAzCE36+3wN0h34D+FUqhHoAhX8Pz4X7wSZg8rcoNB2CUt+Ex8Hj4Li/0HQdgMRxNPwY5W+D8+lvYW1IDsD6Mfc6/zeCYG3zRgq9lcf3gDsj1hEnDRZ4YNoXsk9Z02Q/wDuRKVd3CysbwQrh1cTY+WL7m2dAcG/vAa+ChcFKvzXN2ciPkGKUK7spaBfmJVYbEhpBJBICwZA7HB1dBPnnMAW8IWY3w6SJf1twb3soLueMApMFnHJfBqFJss4wDkE4vyuc4AGlwqzafLLJ4ZtY4AO0Y7sF/A57OC7nTZRYwSyViJjEL4MDvWjjJaaBLxEQyzgBsCS+Hp8FJl8p1iZgpwpU1LmLxxnJL2TTqJLtEzBTg9/yx8DV4PayttJk7DsAo3BfwOHwYruCFvuMABDhYvQm+Co+CMvdFPQB8e/lcyH0A3Bq2HpRCNQD8vY+Er0BuBZOtZKoYgF3gQ/AJuCcvKJMaAI6UaQyzUiJmOeTyLRewjoOxP/80cYmY1QDn7yy1wvk8t3hx5SwXXCImkrKVQC7XchWMu3iqdsvkwFhLxHQZA/Dfcpl02xonVR9o4d65HSCXn5+GOXc+4X6/sns7lNvtkvuxSwBmiSsgV+/4QIQFIvi0juvo3MJlauhLAPhJ9CjkfP4SmPR9qEhfAmAScQDE6RKAWSoR02dcIkYYl4gRxyVixHGJGDNeHABxHABxHABxHABxHABxUgOgUCJmFuAiTwzyJWL6ikvEmM6MbUeQ6QEOgDhNAeB/umDyprYPmwLAKpkydXN7CPuuttJpUwDehy+HpskQDuDZh5U0zQIIN1zeBg+C0yiSYNrDsrbPQL7wyh1FlcQEYAgrYjkAecAARNUwbBMA00M8DRTHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHAZBmbu4/x6swK3hIFr4AAAAASUVORK5CYII=' : `data:${file.type};base64,${dataBase64}`;
                    remove.addEventListener('click', () => {
                        div.remove();
                        for (let i = mediaArray.length - 1; i >= 0; i--) {
                            let m = mediaArray[i];
                            if (m.id === img.id) mediaArray.splice(i, 1);
                        }
                    });
                    div.append(img, progress, remove);
                    if (!file.type.includes('video')) {
                        img.addEventListener('click', () => {
                            new Viewer(mediaContainer);
                        });
                        div.append(alt);
                    }
                    mediaContainer.append(div);
                });
            }
        }
    }
}
let isURL = (str) => {
    try {
        new URL(str);
        return true;
    } catch (_) {
        return false;
    }
}
function handleDrop(event, mediaArray, mediaContainer) {
    let text = event.dataTransfer.getData("Text").trim();
    if(text.length <= 1) {
        event.stopPropagation();
        event.preventDefault();
        let files = event.dataTransfer.files;
        handleFiles(files, mediaArray, mediaContainer);
    }
}
function getMedia(mediaArray, mediaContainer) {
    let input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/png,image/jpeg,image/gif,video/mp4,video/mov';
    input.addEventListener('change', () => {
        handleFiles(input.files, mediaArray, mediaContainer);
    });
    input.click();
};
function getDMMedia(mediaArray, mediaContainer, modalElement) {
    let input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,image/gif';
    input.addEventListener('change', async () => {
        let files = input.files;
        let images = [];
        let gifs = [];
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            if (file.type.includes('gif')) {
                // max 15 mb
                if (file.size > 15000000) {
                    return alert('GIFs must be less than 15 MB');
                }
                gifs.push(file);
            } else if (file.type.includes('image')) {
                // max 5 mb
                if (file.size > 5000000) {
                    return alert('Images must be less than 5 MB');
                }
                images.push(file);
            }
        }
        // get base64 data
        let media = [...images, ...gifs];
        let base64Data = [];
        for (let i = 0; i < media.length; i++) {
            let file = media[i];
            let reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = () => {
                base64Data.push(reader.result);
                if (base64Data.length === media.length) {
                    mediaContainer.innerHTML = '';
                    while (mediaArray.length > 0) {
                        mediaArray.pop();
                    }
                    base64Data.forEach(data => {
                        let div = document.createElement('div');
                        let img = document.createElement('img');
                        div.title = file.name;
                        div.id = `new-tweet-media-img-${Date.now()}${Math.random()}`.replace('.', '-');
                        div.className = "new-tweet-media-img-div";
                        img.className = "new-tweet-media-img";
                        let progress = document.createElement('span');
                        progress.hidden = true;
                        progress.className = "new-tweet-media-img-progress";
                        let remove = document.createElement('span');
                        remove.className = "new-tweet-media-img-remove";
                        let dataBase64 = arrayBufferToBase64(data);
                        let mediaObject = {
                            div, img,
                            id: img.id,
                            data: data,
                            dataBase64: dataBase64,
                            type: file.type,
                            category: file.type.includes('gif') ? 'tweet_gif' : file.type.includes('video') ? 'tweet_video' : 'tweet_image'
                        };
                        mediaArray.push(mediaObject);
                        img.src = file.type.includes('video') ? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAWUSURBVHhe7Z1pqG5THMbPNV1jul1TJEOZuqYMRZEpoRARvlw+uIjwASlRFIkMHwzJ8AVfZMhYOGRKESlDkciQyJhknj3PXu9b3nP2sPba9x3Wfp5f/dpr77p1zl7Ped+11l77f5fMz8/PGV3WGByNKA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOA6AOG3eC1gGl4ammXF+h9+HZj0xAdgC3gwPhw5AHjAAL8Kz4Re8UEVTANaCT8HDijOTGy9B9t1fxVkJTWOAneAhoWky5ADIPqykKQCbQA8U84V9xz6spKlzlwyOJl9q+9B/3eI4AOI0zQIOhs+H5iJeh3fBP4qzcjaDF8DNizPTls/gDfCH4qycDeBZcLfibDEcxL8QmotJDQA7fVf4QXFWz8nwvtA0LTkJPhCatewM34LrFGej1AYg9SvgF/hNaDby8eBo2vPp4NjEl5B90hqPAcRxAMRxAMRxAMRxAMRxAMRJDcCaA2NYe3A07Ym9d236Y4TUAGwET4VlCw//Z124MjRNAmfADUOzEnb8iZB90pouS8H/QC5A1C0FMwDcUWTS4YLbz6FZCgOwFaz6Yx7LUrDJh7EsBZue0KcA/Av/Dk0TS18CwIcm/KjbEV4Nf4Qmgr4E4ErIbdAfwUvhXvB+WLkb1gS6BICzAG5Y+KTG2EfGXVn42PRDeAo8AnLjSs5wplV2b4dy3z/7IokuATgHbtfg9vBuOA04JngOHgjPhJ/D3Lgdlt3XhV4Ek0gNAL9jH4RNg66f4J2hOTX4lgx/hj3gdbBuTj1r3At/C81KuA5zD0wa96QGgB0fO+L+c3CcNt/Bi+G+8BGYw4wh9t616Y8R+jIIbMN78AR4NHyTF5RRDADhoInvPO4Pz4NfQUlUAzCE36+3wN0h34D+FUqhHoAhX8Pz4X7wSZg8rcoNB2CUt+Ex8Hj4Li/0HQdgMRxNPwY5W+D8+lvYW1IDsD6Mfc6/zeCYG3zRgq9lcf3gDsj1hEnDRZ4YNoXsk9Z02Q/wDuRKVd3CysbwQrh1cTY+WL7m2dAcG/vAa+ChcFKvzXN2ciPkGKUK7spaBfmJVYbEhpBJBICwZA7HB1dBPnnMAW8IWY3w6SJf1twb3soLueMApMFnHJfBqFJss4wDkE4vyuc4AGlwqzafLLJ4ZtY4AO0Y7sF/A57OC7nTZRYwSyViJjEL4MDvWjjJaaBLxEQyzgBsCS+Hp8FJl8p1iZgpwpU1LmLxxnJL2TTqJLtEzBTg9/yx8DV4PayttJk7DsAo3BfwOHwYruCFvuMABDhYvQm+Co+CMvdFPQB8e/lcyH0A3Bq2HpRCNQD8vY+Er0BuBZOtZKoYgF3gQ/AJuCcvKJMaAI6UaQyzUiJmOeTyLRewjoOxP/80cYmY1QDn7yy1wvk8t3hx5SwXXCImkrKVQC7XchWMu3iqdsvkwFhLxHQZA/Dfcpl02xonVR9o4d65HSCXn5+GOXc+4X6/sns7lNvtkvuxSwBmiSsgV+/4QIQFIvi0juvo3MJlauhLAPhJ9CjkfP4SmPR9qEhfAmAScQDE6RKAWSoR02dcIkYYl4gRxyVixHGJGDNeHABxHABxHABxHABxHABxUgOgUCJmFuAiTwzyJWL6ikvEmM6MbUeQ6QEOgDhNAeB/umDyprYPmwLAKpkydXN7CPuuttJpUwDehy+HpskQDuDZh5U0zQIIN1zeBg+C0yiSYNrDsrbPQL7wyh1FlcQEYAgrYjkAecAARNUwbBMA00M8DRTHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHARDHAZBmbu4/x6swK3hIFr4AAAAASUVORK5CYII=' : `data:${file.type};base64,${dataBase64}`;
                        remove.addEventListener('click', () => {
                            div.remove();
                            for (let i = mediaArray.length - 1; i >= 0; i--) {
                                let m = mediaArray[i];
                                if (m.id === img.id) mediaArray.splice(i, 1);
                            }
                        });
                        div.append(img, progress, remove);
                        if (!file.type.includes('video')) {
                            img.addEventListener('click', () => {
                                new Viewer(mediaContainer);
                            });
                        }
                        mediaContainer.append(div);
                        setTimeout(() => modalElement.scrollTop = modalElement.scrollHeight, 50);
                    });
                }
            }
        }
    });
    input.click();
};
function timeElapsed(targetTimestamp) {
    let currentDate = new Date();
    let currentTimeInms = currentDate.getTime();
    let targetDate = new Date(targetTimestamp);
    let targetTimeInms = targetDate.getTime();
    let elapsed = Math.floor((currentTimeInms - targetTimeInms) / 1000);
    const MonthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];
    if (elapsed < 1) {
        return '0s';
    }
    if (elapsed < 60) { //< 60 sec
        return `${elapsed}s`;
    }
    if (elapsed < 3600) { //< 60 minutes
        return `${Math.floor(elapsed / (60))}m`;
    }
    if (elapsed < 86400) { //< 24 hours
        return `${Math.floor(elapsed / (3600))}h`;
    }
    if (elapsed < 604800) { //<7 days
        return `${Math.floor(elapsed / (86400))}d`;
    }
    if (elapsed < 2628000) { //<1 month
        return `${targetDate.getDate()} ${MonthNames[targetDate.getMonth()]}`;
    }
    return `${targetDate.getDate()} ${MonthNames[targetDate.getMonth()]} ${targetDate.getFullYear()}`; //more than a monh
}
function openInNewTab(href) {
    Object.assign(document.createElement('a'), {
        target: '_blank',
        rel: 'noopener noreferrer',
        href: href,
    }).click();
}
function escapeHTML(unsafe) {
    return unsafe
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "’");
 }
function stringInsert(string, index, value) {
    return string.substr(0, index) + value + string.substr(index);
}
function generatePoll(tweet, tweetElement, user) {
    let pollElement = tweetElement.getElementsByClassName('tweet-poll')[0];
    pollElement.innerHTML = '';
    let poll = tweet.card.binding_values;
    let choices = Object.keys(poll).filter(key => key.endsWith('label')).map((key, i) => ({
        label: poll[key].string_value,
        count: poll[key.replace('label', 'count')] ? +poll[key.replace('label', 'count')].string_value : 0,
        id: i+1
    }));
    let voteCount = choices.reduce((acc, cur) => acc + cur.count, 0);
    if(poll.selected_choice || user.id_str === tweet.user.id_str || (poll.counts_are_final && poll.counts_are_final.boolean_value)) {
        for(let i in choices) {
            let choice = choices[i];
            if(user.id_str !== tweet.user.id_str && poll.selected_choice && choice.id === +poll.selected_choice.string_value) {
                choice.selected = true;
            }
            choice.percentage = Math.round(choice.count / voteCount * 100);
            let choiceElement = document.createElement('div');
            choiceElement.classList.add('choice');
            choiceElement.innerHTML = `
                <div class="choice-bg" style="width:${choice.percentage}%" data-percentage="${choice.percentage}"></div>
                <div class="choice-label">
                    <span>${escapeHTML(choice.label)}</span>
                    ${choice.selected ? `<span class="choice-selected"></span>` : ''}
                </div>
                ${isFinite(choice.percentage) ? `<div class="choice-count">${choice.count} (${choice.percentage}%)</div>` : '<div class="choice-count">0</div>'}
            `;
            pollElement.append(choiceElement);
        }
    } else {
        for(let i in choices) {
            let choice = choices[i];
            let choiceElement = document.createElement('div');
            choiceElement.classList.add('choice', 'choice-unselected');
            choiceElement.innerHTML = `
                <div class="choice-bg" style="width:100%"></div>
                <div class="choice-label">${escapeHTML(choice.label)}</div>
            `;
            choiceElement.addEventListener('click', async () => {
                let newCard = await API.pollVote(poll.api.string_value, tweet.id_str, tweet.card.url, tweet.card.name, choice.id);
                tweet.card = newCard.card;
                generateCard(tweet, tweetElement, user);
            });
            pollElement.append(choiceElement);
        }
    }
    if(tweet.card.url.startsWith('card://')) {
        let footer = document.createElement('span');
        footer.classList.add('poll-footer');
        footer.innerHTML = `${voteCount} vote${voteCount === 1 ? '' : 's'}${(!poll.counts_are_final || !poll.counts_are_final.boolean_value) && poll.end_datetime_utc ? ` ・ Ends at ${new Date(poll.end_datetime_utc.string_value).toLocaleString()}` : ''}`;
        pollElement.append(footer);
    }
}
function generateCard(tweet, tweetElement, user) {
    if(!tweet.card) return;
    if(tweet.card.name === 'promo_image_convo') {
        let vals = tweet.card.binding_values;
        let a = document.createElement('a');
        a.href = vals.thank_you_url.string_value;
        a.target = '_blank';
        a.title = vals.thank_you_text.string_value;
        let img = document.createElement('img');
        img.src = vals.promo_image.image_value.url;
        img.width = sizeFunctions[1](vals.promo_image.image_value.width, vals.promo_image.image_value.height)[0];
        img.height = sizeFunctions[1](vals.promo_image.image_value.width, vals.promo_image.image_value.height)[1];
        img.className = 'tweet-media-element';
        a.append(img);
        tweetElement.getElementsByClassName('tweet-poll')[0].append(a);
    } else if(tweet.card.url.startsWith('card://')) {
        generatePoll(tweet, tweetElement, user);
    } else if(tweet.card.name === "player") {
        let iframe = document.createElement('iframe');
        iframe.src = tweet.card.binding_values.player_url.string_value;
        iframe.classList.add('tweet-player');
        iframe.width = 450;
        iframe.height = 250;
        tweetElement.getElementsByClassName('tweet-poll')[0].innerHTML = '';
        tweetElement.getElementsByClassName('tweet-poll')[0].append(iframe);
    }
}

function luminance(r, g, b) {
    var a = [r, g, b].map(function(v) {
      v /= 255;
      return v <= 0.03928 ?
        v / 12.92 :
        Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}
function contrast(rgb1, rgb2) {
    var lum1 = luminance(rgb1[0], rgb1[1], rgb1[2]);
    var lum2 = luminance(rgb2[0], rgb2[1], rgb2[2]);
    var brightest = Math.max(lum1, lum2);
    var darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) /
      (darkest + 0.05);
}
const hex2rgb = (hex) => {
      if(!hex.startsWith('#')) hex = `#${hex}`;
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      // return {r, g, b} // return an object
      return [ r, g, b ]
}
  
const colorShade = (col, amt) => {
    col = col.replace(/^#/, '')
    if (col.length === 3) col = col[0] + col[0] + col[1] + col[1] + col[2] + col[2]
  
    let [r, g, b] = col.match(/.{2}/g);
    ([r, g, b] = [parseInt(r, 16) + amt, parseInt(g, 16) + amt, parseInt(b, 16) + amt])
  
    r = Math.max(Math.min(255, r), 0).toString(16)
    g = Math.max(Math.min(255, g), 0).toString(16)
    b = Math.max(Math.min(255, b), 0).toString(16)
  
    const rr = (r.length < 2 ? '0' : '') + r
    const gg = (g.length < 2 ? '0' : '') + g
    const bb = (b.length < 2 ? '0' : '') + b
  
    return `#${rr}${gg}${bb}`
}
const mediaClasses = [
    undefined,
    'tweet-media-element-one',
    'tweet-media-element-two',
    'tweet-media-element-three',
    'tweet-media-element-four',
];
const sizeFunctions = [
    undefined,
    (w, h) => [w > 450 ? 450 : w, h > 500 ? 500 : h],
    (w, h) => [w > 200 ? 200 : w, h > 400 ? 400 : h],
    (w, h) => [w > 150 ? 150 : w, h > 250 ? 250 : h],
    (w, h) => [w > 100 ? 100 : w, h > 150 ? 150 : h],
];
const quoteSizeFunctions = [
    undefined,
    (w, h) => [w > 400 ? 400 : w, h > 400 ? 400 : h],
    (w, h) => [w > 200 ? 200 : w, h > 400 ? 400 : h],
    (w, h) => [w > 125 ? 125 : w, h > 200 ? 200 : h],
    (w, h) => [w > 100 ? 100 : w, h > 150 ? 150 : h],
];

setInterval(() => {
    chrome.storage.local.set({userUpdates: {}}, () => {});
    chrome.storage.local.set({peopleRecommendations: {}}, () => {});
    chrome.storage.local.set({tweetReplies: {}}, () => {});
    chrome.storage.local.set({tweetLikers: {}}, () => {});
    chrome.storage.local.set({listData: {}}, () => {});
}, 60000*10);

// Account
API.verifyCredentials = () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['credentials'], d => {
            if(d.credentials && Date.now() - d.credentials.date < 60000*15) {
                return resolve(d.credentials.data);
            }
            fetch(`https://api.twitter.com/1.1/account/verify_credentials.json`, {
                headers: {
                    "authorization": OLDTWITTER_CONFIG.oauth_key,
                    "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                    "x-twitter-auth-type": "OAuth2Session"
                },
                credentials: "include"
            }).then(response => response.json()).then(data => {
                if (data.errors && data.errors[0].code === 32) {
                    return reject("Not logged in");
                }
                if (data.errors && data.errors[0]) {
                    return reject(data.errors[0].message);
                }
                resolve(data);
                chrome.storage.local.set({credentials: {
                    date: Date.now(),
                    data
                }}, () => {});
            }).catch(e => {
                reject(e);
            });
        });
    })
}
API.logout = () => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/1.1/account/logout.json`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session"
            },
            credentials: "include",
            method: 'post',
            body: 'redirectAfterLogout=https%3A%2F%2Ftwitter.com%2Faccount%2Fswitch'
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}
API.getAccounts = (cache = true) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['accountsList'], d => {
            if(cache && d.accountsList && Date.now() - d.accountsList.date < 60000*5) {
                return resolve(d.accountsList.data);
            }
            fetch(`https://twitter.com/i/api/1.1/account/multi/list.json`, {
                headers: {
                    "authorization": OLDTWITTER_CONFIG.public_token,
                    "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                    "x-twitter-auth-type": "OAuth2Session",
                    "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/",
                    "x-twitter-active-user": "yes",
                    "x-twitter-client-language": "en"
                },
                credentials: "include"
            }).then(i => i.json()).then(data => {
                if (data.errors && data.errors[0].code === 32) {
                    return reject("Not logged in");
                }
                if (data.errors && data.errors[0]) {
                    return reject(data.errors[0].message);
                }
                resolve(data);
                chrome.storage.local.set({accountsList: {
                    date: Date.now(),
                    data
                }}, () => {});
            }).catch(e => {
                reject(e);
            });
        });
    });
}
API.switchAccount = id => {
    return new Promise((resolve, reject) => {
        let status;
        fetch(`https://twitter.com/i/api/1.1/account/multi/switch.json`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "x-twitter-active-user": "yes",
                "x-twitter-client-language": "en",
                "content-type": "application/x-www-form-urlencoded"
            },
            credentials: "include",
            method: 'post',
            body: `user_id=${id}`
        }).then(i => {
            status = i.status;
            return i.text();
        }).then(data => {
            if(String(status).startsWith("2")) {
                resolve(data);
            } else {
                reject(data);
            }
        }).catch(e => {
            reject(e);
        });
    });
}
API.updateProfile = (data) => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/account/update_profile.json`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session"
            },
            credentials: "include",
            method: "post",
            body: new URLSearchParams(data).toString()
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}
API.getSettings = () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['twitterSettings'], d => {
            if(d.twitterSettings && Date.now() - d.twitterSettings.date < 60000*10) {
                return resolve(d.twitterSettings.data);
            }
            fetch(`https://api.twitter.com/1.1/account/settings.json`, {
                headers: {
                    "authorization": OLDTWITTER_CONFIG.oauth_key,
                    "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                    "x-twitter-auth-type": "OAuth2Session",
                },
                credentials: "include"
            }).then(i => i.json()).then(data => {
                if (data.errors && data.errors[0].code === 32) {
                    return reject("Not logged in");
                }
                if (data.errors && data.errors[0]) {
                    return reject(data.errors[0].message);
                }
                resolve(data);
                chrome.storage.local.set({twitterSettings: {
                    date: Date.now(),
                    data
                }}, () => {});
            }).catch(e => {
                reject(e);
            });
        });
    });
}

// Timelines
API.getTimeline = (max_id) => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/statuses/home_timeline.json?count=40&include_my_retweet=1&cards_platform=Web-12&include_cards=1&include_entities=1&include_user_entities=1&include_cards=1&send_error_codes=1&tweet_mode=extended&include_ext_alt_text=true&include_reply_count=true${max_id ? `&max_id=${max_id}` : ''}`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session"
            },
            credentials: "include"
        }).then(response => response.json()).then(data => {
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}
API.getAlgoTimeline = (cursor, count = 25) => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/2/timeline/home.json?${cursor ? `cursor=${cursor.replace(/\+/g, '%2B')}&` : ''}include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&skip_status=1&cards_platform=Web-12&include_cards=1&include_ext_alt_text=true&include_quote_count=true&include_reply_count=1&tweet_mode=extended&include_ext_collab_control=true&include_entities=true&include_user_entities=true&include_ext_media_color=true&include_ext_media_availability=true&include_ext_sensitive_media_warning=true&include_ext_trusted_friends_metadata=true&send_error_codes=true&simple_quoted_tweet=true&earned=1&count=${count}&lca=true&ext=mediaStats%2ChighlightedLabel%2ChasNftAvatar%2CvoiceInfo%2Cenrichments%2CsuperFollowMetadata%2CunmentionInfo%2Ccollab_control&browserNotificationPermission=default`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session"
            },
            credentials: "include"
        }).then(response => response.json()).then(data => {
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            let tweets = data.globalObjects.tweets;
            let users = data.globalObjects.users;
            let entries = data.timeline.instructions.find(i => i.addEntries);
            if(!entries) { 
                return reject({
                    list: [],
                    cursor: undefined
                });
            }
            entries = entries.addEntries.entries;
            let list = [];
            for (let i = 0; i < entries.length; i++) {
                let e = entries[i].content.item;
                if(!e || !e.content || !e.content.tweet) continue;
                if(e.content.tweet.promotedMetadata) continue;
                let tweet = tweets[e.content.tweet.id];
                let user = users[tweet.user_id_str];
                tweet.user = user;
                tweet.id_str = e.content.tweet.id;
                if(e.feedbackInfo) tweet.feedback = e.feedbackInfo.feedbackKeys.map(f => data.timeline.responseObjects.feedbackActions[f]);
                if(tweet.retweeted_status_id_str) {
                    tweet.retweeted_status = tweets[tweet.retweeted_status_id_str];
                    tweet.retweeted_status.user = users[tweet.retweeted_status.user_id_str];
                    tweet.retweeted_status.user.id_str = tweet.retweeted_status.user_id_str;
                    tweet.retweeted_status.id_str = tweet.retweeted_status_id_str;
                }
                if(tweet.quoted_status_id_str) {
                    tweet.quoted_status = tweets[tweet.quoted_status_id_str];
                    tweet.quoted_status.user = users[tweet.quoted_status.user_id_str];
                    tweet.quoted_status.user.id_str = tweet.quoted_status.user_id_str;
                    tweet.quoted_status.id_str = tweet.quoted_status_id_str;
                }
                if(e.content.tweet.socialContext) {
                    if(e.content.tweet.socialContext.topicContext) {
                        tweet.socialContext = data.globalObjects.topics[e.content.tweet.socialContext.topicContext.topicId];
                    } else {
                        tweet.socialContext = e.content.tweet.socialContext.generalContext;
                    }
                }
                list.push(tweet);
            }
            return resolve({
                list,
                cursor: entries.find(e => e.entryId.startsWith('cursor-bottom-')).content.operation.cursor.value
            })
        }).catch(e => {
            reject(e);
        });
    });
}

// Discovering
API.discoverPeople = (cache = true) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['discoverData'], d => {
            if(cache && d.discoverData && Date.now() - d.discoverData.date < 60000*5) {
                return resolve(d.discoverData.data);
            }
            fetch(`https://twitter.com/i/api/2/people_discovery/modules_urt.json?include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&include_ext_has_nft_avatar=1&skip_status=1&cards_platform=Web-12&include_cards=1&include_ext_alt_text=true&include_quote_count=true&include_reply_count=1&tweet_mode=extended&include_ext_collab_control=true&include_entities=true&include_user_entities=true&include_ext_media_color=true&include_ext_media_availability=true&include_ext_sensitive_media_warning=true&include_ext_trusted_friends_metadata=true&send_error_codes=true&simple_quoted_tweet=true&count=20&display_location=connect&client_type=rweb&ext=mediaStats%2ChighlightedLabel%2ChasNftAvatar%2CvoiceInfo%2Cenrichments%2CsuperFollowMetadata%2CunmentionInfo%2Ccollab_control`, {
                headers: {
                    "authorization": OLDTWITTER_CONFIG.public_token,
                    "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                    "x-twitter-auth-type": "OAuth2Session",
                    "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/",
                    "x-twitter-active-user": "yes",
                    "x-twitter-client-language": "en"
                },
                credentials: "include"
            }).then(i => i.json()).then(data => {
                if (data.errors && data.errors[0].code === 32) {
                    return reject("Not logged in");
                }
                if (data.errors && data.errors[0]) {
                    return reject(data.errors[0].message);
                }
                resolve(data);
                chrome.storage.local.set({discoverData: {
                    date: Date.now(),
                    data
                }}, () => {});
            }).catch(e => {
                reject(e);
            });
        });
    });
}
API.peopleRecommendations = (id, cache = true, by_screen_name = false) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([`peopleRecommendations`], d => {
            if(!d.peopleRecommendations) d.peopleRecommendations = {};
            if(cache && d.peopleRecommendations[`${id}${by_screen_name}`] && Date.now() - d.peopleRecommendations[`${id}${by_screen_name}`].date < 60000*5) {
                return resolve(d.peopleRecommendations[`${id}${by_screen_name}`].data);
            }
            fetch(`https://twitter.com/i/api/1.1/users/recommendations.json?include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&include_ext_has_nft_avatar=1&skip_status=1&&pc=true&display_location=profile_accounts_sidebar&limit=4&${by_screen_name ? 'screen_name' : 'user_id'}=${id}&ext=mediaStats%2ChighlightedLabel%2ChasNftAvatar%2CvoiceInfo%2Cenrichments%2CsuperFollowMetadata%2CunmentionInfo%2Ccollab_control`, {
                headers: {
                    "authorization": OLDTWITTER_CONFIG.public_token,
                    "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                    "x-twitter-auth-type": "OAuth2Session",
                    "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/",
                    "x-twitter-active-user": "yes",
                    "x-twitter-client-language": "en"
                },
                credentials: "include"
            }).then(i => i.json()).then(data => {
                if (data.errors && data.errors[0].code === 32) {
                    return reject("Not logged in");
                }
                if (data.errors && data.errors[0]) {
                    return reject(data.errors[0].message);
                }
                resolve(data);
                d.peopleRecommendations[`${id}${by_screen_name}`] = {
                    date: Date.now(),
                    data
                };
                chrome.storage.local.set({peopleRecommendations: d.peopleRecommendations}, () => {});
            }).catch(e => {
                reject(e);
            });
        });
    });
}
API.getTrends = () => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/trends/plus.json?max_trends=8`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            credentials: "include",
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}

/*
    media_type: "video/mp4",
    media_category: "tweet_video" | "tweet_image" | "tweet_gif",
    media: ArrayBuffer,
    loadCallback: function,
    alt: "alt text"
*/
API.uploadMedia = (data) => {
    return new Promise(async (resolve, reject) => {
        let obj = {
            command: "INIT",
            total_bytes: data.media.byteLength,
            media_type: data.media_type
        };
        if(data.media_category) obj.media_category = data.media_category;
        let initUpload = await fetch(`https://upload.twitter.com/1.1/media/upload.json`, {
            headers: { "authorization": OLDTWITTER_CONFIG.oauth_key, "x-csrf-token": OLDTWITTER_CONFIG.csrf, "x-twitter-auth-type": "OAuth2Session", "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/", "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
            credentials: "include",
            method: "post",
            body: new URLSearchParams(obj).toString()
        }).then(i => i.json());
        if (initUpload.errors && initUpload.errors[0]) {
            return reject(initUpload.errors[0].message);
        }
        let mediaId = initUpload.media_id_string;
        let segments = [];
        let segmentSize = 1084576;
        let segmentCount = Math.ceil(data.media.byteLength / segmentSize);
        for (let i = 0; i < segmentCount; i++) {
            let segmentData = data.media.slice(i * segmentSize, (i + 1) * segmentSize);
            segments.push(segmentData);
        }
        for(let i in segments) {
            let segment = segments[i];
            try {
                await fetch(`https://upload.twitter.com/1.1/media/upload.json`, {
                    headers: { "authorization": OLDTWITTER_CONFIG.oauth_key, "x-csrf-token": OLDTWITTER_CONFIG.csrf, "x-twitter-auth-type": "OAuth2Session", "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/", "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
                    credentials: "include",
                    method: "post",
                    body: new URLSearchParams({
                        command: "APPEND",
                        media_id: mediaId,
                        media_data: arrayBufferToBase64(segment),
                        segment_index: +i
                    }).toString()
                }).then(i => i.text());
            } catch (e) {
                await new Promise((resolve, reject) => {
                    console.error(e);
                    setTimeout(async () => {
                        await fetch(`https://upload.twitter.com/1.1/media/upload.json`, {
                            headers: { "authorization": OLDTWITTER_CONFIG.oauth_key, "x-csrf-token": OLDTWITTER_CONFIG.csrf, "x-twitter-auth-type": "OAuth2Session", "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/", "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
                            credentials: "include",
                            method: "post",
                            body: new URLSearchParams({
                                command: "APPEND",
                                media_id: mediaId,
                                media_data: arrayBufferToBase64(segment),
                                segment_index: +i
                            }).toString()
                        }).then(i => i.text()).catch(reject);
                        if(data.loadCallback) {
                            data.loadCallback({
                                text: `Uploading`,
                                progress: Math.round(((+i + 1) / segments.length)*100)
                            });
                        }
                        resolve(true);
                    }, 1000);
                });
            }
            if(data.loadCallback) {
                data.loadCallback({
                    text: `Uploading`,
                    progress: Math.round(((+i + 1) / segments.length)*100)
                });
            }
        }
        let finalData = await fetch(`https://upload.twitter.com/1.1/media/upload.json`, {
            headers: { "authorization": OLDTWITTER_CONFIG.oauth_key, "x-csrf-token": OLDTWITTER_CONFIG.csrf, "x-twitter-auth-type": "OAuth2Session", "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/", "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
            credentials: "include",
            method: "post",
            body: new URLSearchParams({
                command: "FINALIZE",
                media_id: mediaId
            }).toString()
        }).then(i => i.json());
        if (finalData.errors && finalData.errors[0]) {
            return reject(finalData.errors[0].message);
        }
        if(data.alt) {
            try {
                await fetch(`https://upload.twitter.com/1.1/media/metadata/create.json`, {
                    headers: { "authorization": OLDTWITTER_CONFIG.oauth_key, "x-csrf-token": OLDTWITTER_CONFIG.csrf, "x-twitter-auth-type": "OAuth2Session", "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/" },
                    credentials: "include",
                    method: "post",
                    body: JSON.stringify({
                        media_id: mediaId,
                        alt_text: {
                            text: data.alt
                        }
                    })
                }).then(i => i.json());
            } catch(e) {
                console.warn(e);
            }
        }
        if(!finalData.processing_info) {
            return resolve(mediaId);
        }
        let statusTries = 0;
        async function checkStatus() {
            if(statusTries++ > 60*20) return clearInterval(statusInterval);
            await fetch(`https://upload.twitter.com/1.1/media/upload.json?${new URLSearchParams({ command: "STATUS", media_id: mediaId }).toString()}`, {
                headers: { "authorization": OLDTWITTER_CONFIG.oauth_key, "x-csrf-token": OLDTWITTER_CONFIG.csrf, "x-twitter-auth-type": "OAuth2Session", "x-twitter-client-version": "Twitter-TweetDeck-blackbird-chrome/4.0.220630115210 web/", "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
                credentials: "include",
            }).then(i => i.json()).then(i => {
                if (i.processing_info.state === "succeeded") {
                    resolve(i.media_id_string);
                }
                if (i.processing_info.state === "failed") {
                    reject(i.processing_info.error.message);
                }
                if(i.processing_info.state === "in_progress") {
                    setTimeout(checkStatus, i.processing_info.check_after_secs*1000);
                    if(data.loadCallback) {
                        data.loadCallback({
                            text: `Processing`,
                            progress: i.processing_info.progress_percent
                        });
                    }
                }
            });
        };
        setTimeout(checkStatus, 500);
    });
}

// Translations
API.translateTweet = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/1.1/strato/column/None/tweetId=${id},destinationLanguage=None,translationSource=Some(Google),feature=None,timeout=None,onlyCached=None/translation/service/translateTweet`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "x-twitter-client-language": navigator.language ? navigator.language.split('-')[0] : "en"
            },
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve({
                translated_lang: data.localizedSourceLanguage,
                text: data.translation
            });
        }).catch(e => {
            reject(e);
        });
    });
}
API.translateProfile = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/1.1/strato/column/None/profileUserId=${id},destinationLanguage=None,translationSource=Some(Google)/translation/service/translateProfile`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "x-twitter-client-language": navigator.language ? navigator.language.split('-')[0] : "en"
            },
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data.profileTranslation);
        }).catch(e => {
            reject(e);
        });
    });
}

// Notifications
API.getUnreadCount = (cache = true) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['unreadCount'], d => {
            if(cache && d.unreadCount && Date.now() - d.unreadCount.date < 18000) {
                return resolve(d.unreadCount.data);
            }
            fetch(`https://twitter.com/i/api/2/badge_count/badge_count.json?supports_ntab_urt=1`, {
                headers: {
                    "authorization": OLDTWITTER_CONFIG.oauth_key,
                    "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                    "x-twitter-auth-type": "OAuth2Session",
                },
                credentials: "include"
            }).then(i => i.json()).then(data => {
                if (data.errors && data.errors[0].code === 32) {
                    return reject("Not logged in");
                }
                if (data.errors && data.errors[0]) {
                    return reject(data.errors[0].message);
                }
                resolve(data);
                chrome.storage.local.set({unreadCount: {
                    date: Date.now(),
                    data
                }}, () => {});
            }).catch(e => {
                reject(e);
            });
        });
    });
}
API.getNotifications = (cursor, onlyMentions = false) => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/2/notifications/${onlyMentions ? 'mentions' : 'all'}.json?include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&include_ext_has_nft_avatar=1&skip_status=1&cards_platform=Web-12&include_cards=1&include_ext_alt_text=true&include_quote_count=true&include_reply_count=1&tweet_mode=extended&include_ext_collab_control=true&include_entities=true&include_user_entities=true&include_ext_media_color=true&include_ext_media_availability=true&include_ext_sensitive_media_warning=true&include_ext_trusted_friends_metadata=true&send_error_codes=true&simple_quoted_tweet=true&count=50&ext=mediaStats%2ChighlightedLabel%2ChasNftAvatar%2CvoiceInfo%2Cenrichments%2CsuperFollowMetadata%2CunmentionInfo%2Ccollab_control${cursor ? `&cursor=${cursor}` : ''}`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "x-twitter-client-language": "en"
            },
            credentials: "include",
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}
API.markAsReadNotifications = cursor => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/2/notifications/all/last_seen_cursor.json`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/x-www-form-urlencoded",
            },
            credentials: "include",
            method: 'post',
            body: `cursor=${cursor}`
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}

// Profiles
API.getUser = (val, byId = true) => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/users/show.json?${byId ? `user_id=${val}` : `screen_name=${val}`}`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
            },
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}
API.getUserV2 = name => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/mCbpQvZAw6zu_4PvuAUVVQ/UserByScreenName?variables=%7B%22screen_name%22%3A%22${name}%22%2C%22withSafetyModeUserFields%22%3Atrue%2C%22withSuperFollowsUserFields%22%3Atrue%7D`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/json"
            },
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            let result = data.data.user.result;
            result.legacy.id_str = result.rest_id;
            if(result.legacy_extended_profile.birthdate) {
                result.legacy.birthdate = result.legacy_extended_profile.birthdate;
            }
            resolve(result.legacy);
        }).catch(e => {
            reject(e);
        });
    });
}
API.followUser = screen_name => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/friendships/create.json`, {
            method: 'POST',
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            credentials: "include",
            body: `screen_name=${screen_name}`
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}
API.unfollowUser = screen_name => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/friendships/destroy.json`, {
            method: 'POST',
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            credentials: "include",
            body: `screen_name=${screen_name}`
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}
API.cancelFollow = screen_name => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/1.1/friendships/cancel.json`, {
            method: 'POST',
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            credentials: "include",
            body: `screen_name=${screen_name}`
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}
API.getUserTweetsV2 = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/3ywp9kIIW-VQOssauKmLiQ/UserTweets?variables=%7B%22userId%22%3A%22${id}%22%2C%22count%22%3A1%2C%22includePromotedContent%22%3Atrue%2C%22withQuickPromoteEligibilityTweetFields%22%3Atrue%2C%22withSuperFollowsUserFields%22%3Atrue%2C%22withDownvotePerspective%22%3Afalse%2C%22withReactionsMetadata%22%3Afalse%2C%22withReactionsPerspective%22%3Afalse%2C%22withSuperFollowsTweetFields%22%3Atrue%2C%22withVoice%22%3Atrue%2C%22withV2Timeline%22%3Atrue%7D&features=%7B%22dont_mention_me_view_api_enabled%22%3Atrue%2C%22interactive_text_enabled%22%3Atrue%2C%22responsive_web_uc_gql_enabled%22%3Afalse%2C%22vibe_tweet_context_enabled%22%3Afalse%2C%22responsive_web_edit_tweet_api_enabled%22%3Afalse%2C%22standardized_nudges_misinfo%22%3Afalse%2C%22responsive_web_enhance_cards_enabled%22%3Afalse%7D`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/json"
            },
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}
API.getUserTweets = (id, max_id, replies = false) => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/statuses/user_timeline.json?count=100&exclude_replies=${!replies}&include_my_retweet=1&include_rts=1&user_id=${id}${max_id ? `&max_id=${max_id}` : ''}&cards_platform=Web-12&include_entities=1&include_user_entities=1&include_cards=1&send_error_codes=1&tweet_mode=extended&include_ext_alt_text=true&include_reply_count=true`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session"
            },
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}
API.friendsFollowing = (val, by_id = true) => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/1.1/friends/following/list.json?include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&include_ext_has_nft_avatar=1&skip_status=1&cursor=-1&${by_id ? `user_id=${val}` : `screen_name=${val}`}&count=10&with_total_count=true`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session"
            },
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}
API.getRelationship = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/friendships/show.json?source_id=${id}&target_screen_name=JinjersTemple&cards_platform=Web-13&include_entities=1&include_user_entities=1&include_cards=1&send_error_codes=1&tweet_mode=extended&include_ext_alt_text=true&include_reply_count=true`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session"
            },
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}
API.receiveNotifications = (id, receive = false) => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/1.1/friendships/update.json`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/x-www-form-urlencoded"
            },
            credentials: "include",
            method: 'post',
            body: `include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&include_ext_has_nft_avatar=1&skip_status=1&cursor=-1&id=${id}&device=${receive}`
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}
API.blockUser = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/1.1/blocks/create.json`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/x-www-form-urlencoded"
            },
            credentials: "include",
            method: 'post',
            body: `user_id=${id}`
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}
API.unblockUser = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/1.1/blocks/destroy.json`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/x-www-form-urlencoded"
            },
            credentials: "include",
            method: 'post',
            body: `user_id=${id}`
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}
API.muteUser = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/1.1/mutes/users/create.json`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/x-www-form-urlencoded"
            },
            credentials: "include",
            method: 'post',
            body: `user_id=${id}`
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}
API.unmuteUser = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/1.1/mutes/users/destroy.json`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/x-www-form-urlencoded"
            },
            credentials: "include",
            method: 'post',
            body: `user_id=${id}`
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}
API.removeFollower = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/QpNfg0kpPRfjROQ_9eOLXA/RemoveFollower`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/json"
            },
            credentials: "include",
            method: 'post',
            body: JSON.stringify({"variables":{"target_user_id":id},"queryId":"QpNfg0kpPRfjROQ_9eOLXA"})
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}
API.getFavorites = (id, cursor) => {
    return new Promise((resolve, reject) => {
        let obj = {
            "userId": id,
            "count": 50,
            "includePromotedContent": false,
            "withSuperFollowsUserFields": true,
            "withDownvotePerspective": false,
            "withReactionsMetadata": false,
            "withReactionsPerspective": false,
            "withSuperFollowsTweetFields": true,
            "withClientEventToken": false,
            "withBirdwatchNotes": false,
            "withVoice": true,
            "withV2Timeline": true
        };
        if(cursor) obj.cursor = cursor;
        fetch(`https://twitter.com/i/api/graphql/vni8vUvtZvJoIsl49VPudg/Likes?variables=${encodeURIComponent(JSON.stringify(obj))}&features=${encodeURIComponent(JSON.stringify({
            "dont_mention_me_view_api_enabled": true,
            "interactive_text_enabled": true,
            "responsive_web_uc_gql_enabled": false,
            "vibe_tweet_context_enabled": false,
            "responsive_web_edit_tweet_api_enabled": false,
            "standardized_nudges_misinfo": false,
            "responsive_web_enhance_cards_enabled": false
        }))}`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/json"
            },
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve({
                tl: data.data.user.result.timeline_v2.timeline.instructions[0].entries.filter(e => e.entryId.startsWith('tweet-')).map(e => {
                    let tweet = e.content.itemContent.tweet_results.result.legacy;
                    let user = e.content.itemContent.tweet_results.result.core.user_results.result;
                    user.legacy.id_str = user.rest_id;
                    user = user.legacy;
                    tweet.user = user;
                    return tweet;
                }),
                cursor: data.data.user.result.timeline_v2.timeline.instructions[0].entries.find(e => e.entryId.startsWith('cursor-bottom')).content.value
            });
        }).catch(e => {
            reject(e);
        });
    });
}
API.getFollowing = (id, cursor) => {
    return new Promise((resolve, reject) => {
        let obj = {
            "userId": id,
            "count": 50,
            "includePromotedContent": false,
            "withSuperFollowsUserFields": true,
            "withDownvotePerspective": false,
            "withReactionsMetadata": false,
            "withReactionsPerspective": false,
            "withSuperFollowsTweetFields": true,
            "withClientEventToken": false,
            "withBirdwatchNotes": false,
            "withVoice": true,
            "withV2Timeline": true
        };
        if(cursor) obj.cursor = cursor;
        fetch(`https://twitter.com/i/api/graphql/N4YSLBJm3XcABTeX3xLWbQ/Following?variables=${encodeURIComponent(JSON.stringify(obj))}&features=${encodeURIComponent(JSON.stringify({
            "dont_mention_me_view_api_enabled": true,
            "interactive_text_enabled": true,
            "responsive_web_uc_gql_enabled": false,
            "vibe_tweet_context_enabled": false,
            "responsive_web_edit_tweet_api_enabled": false,
            "standardized_nudges_misinfo": false,
            "responsive_web_enhance_cards_enabled": false
        }))}`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/json"
            },
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            let list = data.data.user.result.timeline.timeline.instructions.find(i => i.type === 'TimelineAddEntries').entries;
            resolve({
                list: list.filter(e => e.entryId.startsWith('user-')).map(e => {
                    let user = e.content.itemContent.user_results.result;
                    user.legacy.id_str = user.rest_id;
                    return user.legacy;
                }),
                cursor: list.find(e => e.entryId.startsWith('cursor-bottom-')).content.value
            });
        }).catch(e => {
            reject(e);
        });
    });
}
API.getFollowers = (id, cursor) => {
    return new Promise((resolve, reject) => {
        let obj = {
            "userId": id,
            "count": 50,
            "includePromotedContent": false,
            "withSuperFollowsUserFields": true,
            "withDownvotePerspective": false,
            "withReactionsMetadata": false,
            "withReactionsPerspective": false,
            "withSuperFollowsTweetFields": true,
            "withClientEventToken": false,
            "withBirdwatchNotes": false,
            "withVoice": true,
            "withV2Timeline": true
        };
        if(cursor) obj.cursor = cursor;
        fetch(`https://twitter.com/i/api/graphql/fJSopkDA3UP9priyce4RgQ/Followers?variables=${encodeURIComponent(JSON.stringify(obj))}&features=${encodeURIComponent(JSON.stringify({
            "dont_mention_me_view_api_enabled": true,
            "interactive_text_enabled": true,
            "responsive_web_uc_gql_enabled": false,
            "vibe_tweet_context_enabled": false,
            "responsive_web_edit_tweet_api_enabled": false,
            "standardized_nudges_misinfo": false,
            "responsive_web_enhance_cards_enabled": false
        }))}`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/json"
            },
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            let list = data.data.user.result.timeline.timeline.instructions.find(i => i.type === 'TimelineAddEntries').entries;
            resolve({
                list: list.filter(e => e.entryId.startsWith('user-')).map(e => {
                    let user = e.content.itemContent.user_results.result;
                    user.legacy.id_str = user.rest_id;
                    return user.legacy;
                }),
                cursor: list.find(e => e.entryId.startsWith('cursor-bottom-')).content.value
            });
        }).catch(e => {
            reject(e);
        });
    });
}
API.getFollowersYouFollow = (id, cursor) => {
    return new Promise((resolve, reject) => {
        let obj = {
            "userId": id,
            "count": 50,
            "includePromotedContent": false,
            "withSuperFollowsUserFields": true,
            "withDownvotePerspective": false,
            "withReactionsMetadata": false,
            "withReactionsPerspective": false,
            "withSuperFollowsTweetFields": true,
            "withClientEventToken": false,
            "withBirdwatchNotes": false,
            "withVoice": true,
            "withV2Timeline": true
        };
        if(cursor) obj.cursor = cursor;
        fetch(`https://twitter.com/i/api/graphql/Ta_Zd7mReCZVnThOABfNhA/FollowersYouKnow?variables=${encodeURIComponent(JSON.stringify(obj))}&features=${encodeURIComponent(JSON.stringify({
            "dont_mention_me_view_api_enabled": true,
            "interactive_text_enabled": true,
            "responsive_web_uc_gql_enabled": false,
            "vibe_tweet_context_enabled": false,
            "responsive_web_edit_tweet_api_enabled": false,
            "standardized_nudges_misinfo": false,
            "responsive_web_enhance_cards_enabled": false
        }))}`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/json"
            },
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            let list = data.data.user.result.timeline.timeline.instructions.find(i => i.type === 'TimelineAddEntries').entries;
            resolve({
                list: list.filter(e => e.entryId.startsWith('user-')).map(e => {
                    let user = e.content.itemContent.user_results.result;
                    user.legacy.id_str = user.rest_id;
                    return user.legacy;
                }),
                cursor: list.find(e => e.entryId.startsWith('cursor-bottom-')).content.value
            });
        }).catch(e => {
            reject(e);
        });
    });
}

// Tweets
API.postTweet = data => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/statuses/update.json`, {
            method: 'POST',
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            body: new URLSearchParams(data).toString(),
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}
API.postTweetV2 = data => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/Mvpg1U7PrmuHeYdY_83kLw/CreateTweet`, {
            method: 'POST',
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/json; charset=utf-8"
            },
            credentials: "include",
            body: JSON.stringify(data)
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            let result = data.data.create_tweet.tweet_results.result;
            let tweet = result.legacy;
            tweet.id_str = result.rest_id;
            tweet.user = result.core.user_results.result.legacy;
            tweet.user.id_str = result.core.user_results.result.rest_id;
            if(result.card) {
                tweet.card = result.card.legacy;
                tweet.card.id_str = result.card.rest_id;
                tweet.card.id = result.card.rest_id;
                let binding_values = {};
                for(let i in tweet.card.binding_values) {
                    let bv = tweet.card.binding_values[i];
                    binding_values[bv.key] = bv.value;
                }
                tweet.card.binding_values = binding_values;
            }
            resolve(tweet);
        }).catch(e => {
            reject(e);
        });
    });
}
API.favoriteTweet = data => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/favorites/create.json`, {
            method: 'POST',
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            body: new URLSearchParams(data).toString(),
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}
API.unfavoriteTweet = data => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/favorites/destroy.json`, {
            method: 'POST',
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            body: new URLSearchParams(data).toString(),
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}
API.retweetTweet = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/statuses/retweet/${id}.json`, {
            method: 'POST',
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}
API.deleteTweet = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/statuses/destroy/${id}.json`, {
            method: 'POST',
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}
API.getTweet = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/statuses/show.json?id=${id}&include_my_retweet=1&cards_platform=Web13&include_entities=1&include_user_entities=1&include_cards=1&send_error_codes=1&tweet_mode=extended&include_ext_alt_text=true&include_reply_count=true`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
            },
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}
API.pollVote = (api, tweet_id, card_uri, card_name, selected_choice) => {
    return new Promise((resolve, reject) => {
        fetch(`https://caps.twitter.com/v2/capi/${api.split('//')[1]}`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/x-www-form-urlencoded"
            },
            credentials: "include",
            method: 'post',
            body: `twitter%3Astring%3Acard_uri=${encodeURIComponent(card_uri)}&twitter%3Along%3Aoriginal_tweet_id=${tweet_id}&twitter%3Astring%3Aresponse_card_name=${card_name}&twitter%3Astring%3Acards_platform=Web-12&twitter%3Astring%3Aselected_choice=${selected_choice}`
        }).then(response => response.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    })
}
API.createCard = card_data => {
    return new Promise((resolve, reject) => {
        fetch(`https://caps.twitter.com/v2/cards/create.json`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/x-www-form-urlencoded"
            },
            credentials: "include",
            method: 'post',
            body: `card_data=${encodeURIComponent(JSON.stringify(card_data))}`
        }).then(response => response.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    })
}
let loadingReplies = {};
API.getReplies = (id, cursor) => {
    return new Promise((resolve, reject) => {
        if(cursor) {
            cursor = cursor.replace(/\+/g, '%2B');
        }
        chrome.storage.local.get(['tweetReplies'], d => {
            if(!d.tweetReplies) d.tweetReplies = {};
            if(!cursor) {
                if(d.tweetReplies[id] && Date.now() - d.tweetReplies[id].date < 60000) {
                    return resolve(d.tweetReplies[id].data);
                }
                if(loadingReplies[id]) {
                    return loadingReplies[id].listeners.push([resolve, reject]);
                } else {
                    loadingReplies[id] = {
                        listeners: []
                    };
                }
            }
            fetch(`https://api.twitter.com/2/timeline/conversation/${id}.json?${cursor ? `cursor=${cursor}`: ''}&count=30&include_reply_count=true&cards_platform=Web-13&include_entities=1&include_user_entities=1&include_cards=1&send_error_codes=1&tweet_mode=extended&include_ext_alt_text=true`, {
                headers: {
                    "authorization": OLDTWITTER_CONFIG.oauth_key,
                    "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                    "x-twitter-auth-type": "OAuth2Session",
                    "content-type": "application/x-www-form-urlencoded"
                },
                credentials: "include"
            }).then(i => i.json()).then(data => {
                if (data.errors && data.errors[0].code === 32) {
                    if(!cursor) {
                        loadingReplies[id].listeners.forEach(l => l[1]('Not logged in'));
                        delete loadingReplies[id];
                    }
                    return reject("Not logged in");
                }
                if (data.errors && data.errors[0]) {
                    if(!cursor) {
                        loadingReplies[id].listeners.forEach(l => l[1](data.errors[0].message));
                        delete loadingReplies[id];
                    }
                    return reject(data.errors[0].message);
                }
                let tweetData = data.globalObjects.tweets;
                let userData = data.globalObjects.users;
                let entries = data.timeline.instructions.find(i => i.addEntries).addEntries.entries;
                let list = [];
                for (let i = 0; i < entries.length; i++) {
                    let e = entries[i];
                    if (e.entryId.startsWith('tweet-')) {
                        let tweet = tweetData[e.content.item.content.tweet.id];
                        if(!tweet) continue;
                        let user = userData[tweet.user_id_str];
                        tweet.id_str = e.content.item.content.tweet.id;
                        tweet.user = user;
                        if(tweet.quoted_status_id_str) {
                            tweet.quoted_status = tweetData[tweet.quoted_status_id_str];
                            tweet.quoted_status.user = userData[tweet.quoted_status.user_id_str];
                            tweet.quoted_status.user.id_str = tweet.quoted_status.user_id_str;
                            tweet.quoted_status.id_str = tweet.quoted_status_id_str;
                        }
                        list.push({
                            type: tweet.id_str === id ? 'mainTweet' : 'tweet',
                            data: tweet
                        });
                    } else if (e.entryId.startsWith('tombstone-')) {
                        if(e.content.item.content.tombstone.tweet) {
                            let tweet = tweetData[e.content.item.content.tombstone.tweet.id];
                            let user = userData[tweet.user_id_str];
                            tweet.id_str = e.content.item.content.tombstone.tweet.id;
                            tweet.user = user;
                            if(tweet.quoted_status_id_str) {
                                tweet.quoted_status = tweetData[tweet.quoted_status_id_str];
                                tweet.quoted_status.user = userData[tweet.quoted_status.user_id_str];
                                tweet.quoted_status.user.id_str = tweet.quoted_status.user_id_str;
                                tweet.quoted_status.id_str = tweet.quoted_status_id_str;
                            }
                            tweet.tombstone = e.content.item.content.tombstone.tombstoneInfo.text;
                            list.push({
                                type: tweet.id_str === id ? 'mainTweet' : 'tweet',
                                data: tweet
                            });
                        } else {
                            list.push({
                                type: 'tombstone',
                                data: e.content.item.content.tombstone.tombstoneInfo.text
                            });
                        }
                    } else if(e.entryId.startsWith('conversationThread-')) {
                        let thread = e.content.item.content.conversationThread.conversationComponents.filter(c => c.conversationTweetComponent);
                        let threadList = [];
                        for (let j = 0; j < thread.length; j++) {
                            let t = thread[j];
                            let tweet = tweetData[t.conversationTweetComponent.tweet.id];
                            if(!tweet) continue;
                            let user = userData[tweet.user_id_str];
                            tweet.id_str = t.conversationTweetComponent.tweet.id;
                            if(tweet.quoted_status_id_str) {
                                tweet.quoted_status = tweetData[tweet.quoted_status_id_str];
                                tweet.quoted_status.user = userData[tweet.quoted_status.user_id_str];
                                tweet.quoted_status.user.id_str = tweet.quoted_status.user_id_str;
                                tweet.quoted_status.id_str = tweet.quoted_status_id_str;
                            }
                            tweet.user = user;
                            threadList.push(tweet);
                        }
                        if(threadList.length === 1) {
                            list.push({
                                type: threadList[0].id_str === id ? 'mainTweet' : 'tweet',
                                data: threadList[0]
                            });
                        } else {
                            list.push({
                                type: 'conversation',
                                data: threadList
                            });
                        }
                    }
                }
                let newCursor;
                try {
                    newCursor = entries.find(e => e.entryId.startsWith('cursor-bottom-')).content.operation.cursor.value;
                } catch(e) {}
                resolve({
                    list,
                    cursor: newCursor
                });
                if(!cursor) {
                    loadingReplies[id].listeners.forEach(l => l[0]({
                        list,
                        cursor: newCursor
                    }));
                    delete loadingReplies[id];
                    d.tweetReplies[id] = {
                        date: Date.now(),
                        data: {
                            list,
                            cursor: newCursor
                        }
                    };
                    chrome.storage.local.set({tweetReplies: d.tweetReplies}, () => {});
                }
            }).catch(e => {
                if(!cursor) {
                    loadingReplies[id].listeners.forEach(l => l[1](e));
                    delete loadingReplies[id];
                }
                reject(e);
            });
        });
    });
}
let loadingLikers = {};
API.getTweetLikers = (id, cursor) => {
    return new Promise((resolve, reject) => {
        let obj = {
            "tweetId": id,
            "count": 10,
            "includePromotedContent": false,
            "withSuperFollowsUserFields": true,
            "withDownvotePerspective": false,
            "withReactionsMetadata": false,
            "withReactionsPerspective": false,
            "withSuperFollowsTweetFields": true,
            "withClientEventToken": false,
            "withBirdwatchNotes": false,
            "withVoice": true,
            "withV2Timeline": true
        };
        if(cursor) obj.cursor = cursor;
        chrome.storage.local.get(['tweetLikers'], d => {
            if(!cursor) cursor = '';
            if(!d.tweetLikers) d.tweetLikers = {};
            if(!cursor) {
                if(d.tweetLikers[id] && Date.now() - d.tweetLikers[id].date < 60000) {
                    return resolve(d.tweetLikers[id].data);
                }
                if(loadingLikers[id]) {
                    return loadingLikers[id].listeners.push([resolve, reject]);
                } else {
                    loadingLikers[id] = {
                        listeners: []
                    };
                }
            }
            fetch(`https://twitter.com/i/api/graphql/RMoTahkos95Jcdw-UWlZog/Favoriters?variables=${encodeURIComponent(JSON.stringify(obj))}&features=${encodeURIComponent(JSON.stringify({
                "dont_mention_me_view_api_enabled": true,
                "interactive_text_enabled": true,
                "responsive_web_uc_gql_enabled": false,
                "vibe_tweet_context_enabled": false,
                "responsive_web_edit_tweet_api_enabled": false,
                "standardized_nudges_misinfo": false,
                "responsive_web_enhance_cards_enabled": false
            }))}`, {
                headers: {
                    "authorization": OLDTWITTER_CONFIG.public_token,
                    "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                    "x-twitter-auth-type": "OAuth2Session",
                    "content-type": "application/json"
                },
                credentials: "include"
            }).then(i => i.json()).then(data => {
                if (data.errors && data.errors[0].code === 32) {
                    if(!cursor) {
                        loadingLikers[id].listeners.forEach(l => l[1]('Not logged in'));
                        delete loadingLikers[id];
                    }
                    return reject("Not logged in");
                }
                if (data.errors && data.errors[0]) {
                    if(!cursor) {
                        loadingLikers[id].listeners.forEach(l => l[1](data.errors[0].message));
                        delete loadingLikers[id];
                    }
                    return reject(data.errors[0].message);
                }
                let list = data.data.favoriters_timeline.timeline.instructions.find(i => i.type === 'TimelineAddEntries');
                if(!list) {
                    if(!cursor) {
                        loadingLikers[id].listeners.forEach(l => l[0]({ list: [], cursor: undefined }));
                        delete loadingLikers[id];
                    }
                    return resolve({ list: [], cursor: undefined });
                }
                list = list.entries;
                let rdata = {
                    list: list.filter(e => e.entryId.startsWith('user-')).map(e => {
                        if(e.content.itemContent.user_results.result.__typename === "UserUnavailable") return;
                        let user = e.content.itemContent.user_results.result;
                        user.legacy.id_str = user.rest_id;
                        return user.legacy;
                    }).filter(u => u),
                    cursor: list.find(e => e.entryId.startsWith('cursor-bottom-')).content.value
                };
                resolve(rdata);
                if(!cursor) {
                    loadingLikers[id].listeners.forEach(l => l[0](rdata));
                    delete loadingLikers[id];
                    d.tweetLikers[id] = {
                        date: Date.now(),
                        data: rdata
                    };
                    chrome.storage.local.set({tweetLikers: d.tweetLikers}, () => {});
                }
            }).catch(e => {
                if(!cursor) {
                    loadingLikers[id].listeners.forEach(l => l[1](e));
                    delete loadingLikers[id];
                }
                reject(e);
            });
        });
    });
}
API.getTweetRetweeters = (id, cursor) => {
    return new Promise((resolve, reject) => {
        let obj = {
            "tweetId": id,
            "count": 50,
            "includePromotedContent": false,
            "withSuperFollowsUserFields": true,
            "withDownvotePerspective": false,
            "withReactionsMetadata": false,
            "withReactionsPerspective": false,
            "withSuperFollowsTweetFields": true,
            "withClientEventToken": false,
            "withBirdwatchNotes": false,
            "withVoice": true,
            "withV2Timeline": true
        };
        if(cursor) obj.cursor = cursor;
        fetch(`https://twitter.com/i/api/graphql/qVWT1Tn1FiklyVDqYiOhLg/Retweeters?variables=${encodeURIComponent(JSON.stringify(obj))}&features=${encodeURIComponent(JSON.stringify({
            "dont_mention_me_view_api_enabled": true,
            "interactive_text_enabled": true,
            "responsive_web_uc_gql_enabled": false,
            "vibe_tweet_context_enabled": false,
            "responsive_web_edit_tweet_api_enabled": false,
            "standardized_nudges_misinfo": false,
            "responsive_web_enhance_cards_enabled": false
        }))}`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/json"
            },
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            let list = data.data.retweeters_timeline.timeline.instructions.find(i => i.type === 'TimelineAddEntries');
            if(!list) return resolve({ list: [], cursor: undefined });
            list = list.entries;
            resolve({
                list: list.filter(e => e.entryId.startsWith('user-')).map(e => {
                    if(e.content.itemContent.user_results.result.__typename === "UserUnavailable") return;
                    let user = e.content.itemContent.user_results.result;
                    user.legacy.id_str = user.rest_id;
                    return user.legacy;
                }).filter(u => u),
                cursor: list.find(e => e.entryId.startsWith('cursor-bottom-')).content.value
            });
        }).catch(e => {
            reject(e);
        });
    });
}
API.getTweetQuotes = (id, cursor) => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/2/search/adaptive.json?${cursor ? `cursor=${cursor}&` : ''}include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&include_ext_has_nft_avatar=1&skip_status=1&cards_platform=Web-12&include_cards=1&include_ext_alt_text=true&include_quote_count=true&include_reply_count=1&tweet_mode=extended&include_ext_collab_control=true&include_entities=true&include_user_entities=true&include_ext_media_color=true&include_ext_media_availability=true&include_ext_sensitive_media_warning=true&include_ext_trusted_friends_metadata=true&send_error_codes=true&simple_quoted_tweet=true&q=quoted_tweet_id%3A${id}&vertical=tweet_detail_quote&count=40&pc=1&spelling_corrections=1&include_ext_edit_control=false&ext=mediaStats%2ChighlightedLabel%2ChasNftAvatar%2CvoiceInfo%2Cenrichments%2CsuperFollowMetadata%2CunmentionInfo%2Ccollab_control`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/x-www-form-urlencoded"
            },
            credentials: "include",
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            let tweets = data.globalObjects.tweets;
            let users = data.globalObjects.users;
            let entries = data.timeline.instructions.find(i => i.addEntries);
            if(!entries) return resolve({
                list: [],
                cursor: undefined
            });
            entries = entries.addEntries.entries;
            let list = entries.filter(e => e.entryId.startsWith('sq-I-t-') || e.entryId.startsWith('tweet-'));
            let cursor = entries.find(e => e.entryId.startsWith('sq-cursor-bottom') || e.entryId.startsWith('cursor-bottom'));
            if(!cursor) {
                let entries = data.timeline.instructions.find(i => i.replaceEntry && (i.replaceEntry.entryIdToReplace.includes('sq-cursor-bottom') || i.replaceEntry.entryIdToReplace.includes('cursor-bottom')));
                if(entries) {
                    cursor = entries.replaceEntry.entry.content.operation.cursor.value;
                }
            } else {
                cursor = cursor.content.operation.cursor.value;
            }
            return resolve({
                list: list.map(e => {
                    let tweet = tweets[e.content.item.content.tweet.id];
                    let user = users[tweet.user_id_str];
                    user.id_str = tweet.user_id_str;
                    tweet.quoted_status = tweets[tweet.quoted_status_id_str];
                    tweet.quoted_status.user = users[tweet.quoted_status.user_id_str];
                    tweet.quoted_status.user.id_str = tweet.quoted_status.user_id_str;
                    tweet.user = user;
                    return tweet;
                }),
                cursor
            });
        }).catch(e => {
            reject(e);
        });
    });
}

// Searches
API.search = query => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/search/typeahead.json?q=${encodeURIComponent(query)}&include_can_dm=1&count=5&prefetch=false&cards_platform=Web-13&include_entities=1&include_user_entities=1&include_cards=1&send_error_codes=1&tweet_mode=extended&include_ext_alt_text=true&include_reply_count=true`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
            },
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}
API.searchV2 = (obj, cursor) => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/2/search/adaptive.json?${cursor ? `cursor=${cursor}&` : ''}include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&include_ext_has_nft_avatar=1&skip_status=1&cards_platform=Web-12&include_cards=1&include_ext_alt_text=true&include_quote_count=true&include_reply_count=1&tweet_mode=extended&include_ext_collab_control=true&include_entities=true&include_user_entities=true&include_ext_media_color=true&include_ext_media_availability=true&include_ext_sensitive_media_warning=true&include_ext_trusted_friends_metadata=true&send_error_codes=true&simple_quoted_tweet=true&q=${obj.q}${obj.social_filter ? `&social_filter=${obj.social_filter}`:''}${obj.result_filter ? `&result_filter=${obj.result_filter}`:''}&count=50&query_source=typed_query&pc=1&spelling_corrections=1&include_ext_edit_control=false&ext=mediaStats%2ChighlightedLabel%2ChasNftAvatar%2CvoiceInfo%2Cenrichments%2CsuperFollowMetadata%2CunmentionInfo%2Ccollab_control`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/x-www-form-urlencoded"
            },
            credentials: "include",
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            let tweets = data.globalObjects.tweets;
            let users = data.globalObjects.users;
            let entries = data.timeline.instructions.find(i => i.addEntries);
            if(!entries) return resolve({
                list: [],
                cursor: undefined
            });
            entries = entries.addEntries.entries;
            let list = entries.filter(e => e.entryId.startsWith('sq-I-t-') || e.entryId.startsWith('user-') || e.entryId.startsWith('tweet-'));
            let cursor = entries.find(e => e.entryId.startsWith('sq-cursor-bottom') || e.entryId.startsWith('cursor-bottom'));
            if(!cursor) {
                let entries = data.timeline.instructions.find(i => i.replaceEntry && (i.replaceEntry.entryIdToReplace.includes('sq-cursor-bottom') || i.replaceEntry.entryIdToReplace.includes('cursor-bottom')));
                if(entries) {
                    cursor = entries.replaceEntry.entry.content.operation.cursor.value;
                }
            } else {
                cursor = cursor.content.operation.cursor.value;
            }
            return resolve({
                list: list.map(e => {
                    if(e.entryId.startsWith('sq-I-t-') || e.entryId.startsWith('tweet-')) {
                        let tweet = tweets[e.content.item.content.tweet.id];
                        let user = users[tweet.user_id_str];
                        user.id_str = tweet.user_id_str;
                        if(tweet.quoted_status_id_str) {
                            tweet.quoted_status = tweets[tweet.quoted_status_id_str];
                            tweet.quoted_status.user = users[tweet.quoted_status.user_id_str];
                            tweet.quoted_status.user.id_str = tweet.quoted_status.user_id_str;
                        }
                        if(tweet.retweeted_status_id_str) {
                            tweet.retweeted_status = tweets[tweet.retweeted_status_id_str];
                            tweet.retweeted_status.user = users[tweet.retweeted_status.user_id_str];
                            tweet.retweeted_status.user.id_str = tweet.retweeted_status.user_id_str;
                            tweet.retweeted_status.id_str = tweet.retweeted_status_id_str;
                        }
                        tweet.user = user;
                        tweet.type = 'tweet';
                        return tweet;
                    } else if(e.entryId.startsWith('user-')) {
                        let user = users[e.content.item.content.user.id];
                        user.id_str = e.content.item.content.user.id;
                        user.type = 'user';
                        return user;
                    } else {
                        return e;
                    }
                }),
                cursor
            });
        }).catch(e => {
            reject(e);
        });
    });
}
API.getSavedSearches = (cache = true) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['savedSearches'], d => {
            if(cache && d.savedSearches && Date.now() - d.savedSearches.date < 60000) {
                return resolve(d.savedSearches.data);
            }
            fetch(`https://twitter.com/i/api/1.1/saved_searches/list.json`, {
                headers: {
                    "authorization": OLDTWITTER_CONFIG.oauth_key,
                    "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                    "x-twitter-auth-type": "OAuth2Session",
                },
                credentials: "include"
            }).then(i => i.json()).then(data => {
                if (data.errors && data.errors[0].code === 32) {
                    return reject("Not logged in");
                }
                if (data.errors && data.errors[0]) {
                    return reject(data.errors[0].message);
                }
                resolve(data);
                chrome.storage.local.set({savedSearches: {
                    date: Date.now(),
                    data
                }}, () => {});
            }).catch(e => {
                reject(e);
            });
        });
    });
}
API.deleteSavedSearch = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/1.1/saved_searches/destroy/${id}.json`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/x-www-form-urlencoded"
            },
            credentials: "include",
            method: "post",
            body: "id=" + id
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}
API.saveSearch = q => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/1.1/saved_searches/create.json`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/x-www-form-urlencoded"
            },
            credentials: "include",
            method: "post",
            body: "q=" + encodeURIComponent(q)
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}

// Conversations
API.getInbox = max_id => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['inboxData'], d => {
            if(!max_id && d.inboxData && Date.now() - d.inboxData.date < 18000) {
                return resolve(d.inboxData.data);
            }
            fetch(`https://api.twitter.com/1.1/dm/user_inbox.json?max_conv_count=20&include_groups=true${max_id ? `&max_id=${max_id}` : ''}&cards_platform=Web-13&include_entities=1&include_user_entities=1&include_cards=1&send_error_codes=1&tweet_mode=extended&include_ext_alt_text=true&include_reply_count=true`, {
                headers: {
                    "authorization": OLDTWITTER_CONFIG.oauth_key,
                    "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                    "x-twitter-auth-type": "OAuth2Session"
                },
                credentials: "include"
            }).then(i => i.json()).then(data => {
                if (data.errors && data.errors[0]) {
                    return reject(data.errors[0].message);
                }
                resolve(data.user_inbox);
                if(!max_id) chrome.storage.local.set({inboxData: {
                    date: Date.now(),
                    data: data.user_inbox
                }}, () => {});
            }).catch(e => {
                reject(e);
            });
        });
    });
}
API.markRead = eventId => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/dm/conversation/mark_read.json`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            credentials: "include",
            method: 'post',
            body: `last_read_event_id=${eventId}`
        }).then(i => i.text()).then(data => {
            resolve(1);
        }).catch(e => {
            reject(e);
        });
    });
}
API.getConversation = (id, max_id) => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/dm/conversation/${id}.json?ext=altText${max_id ? `&max_id=${max_id}` : ''}&count=100&cards_platform=Web-13&include_entities=1&include_user_entities=1&include_cards=1&send_error_codes=1&tweet_mode=extended&include_ext_alt_text=true&include_reply_count=true`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session"
            },
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data.conversation_timeline);
        }).catch(e => {
            reject(e);
        });
    });
}
API.sendMessage = obj => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/dm/new.json`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            credentials: "include",
            method: 'post',
            body: new URLSearchParams(obj).toString()
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            resolve(data);
        }).catch(e => {
            reject(e);
        });
    });
}
API.getUserUpdates = cursor => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['userUpdates'], d => {
            if(!cursor) cursor = '';
            if(!d.userUpdates) d.userUpdates = {};
            if(d.userUpdates[cursor] && Date.now() - d.userUpdates[cursor].date < 4000) {
                return resolve(d.userUpdates[cursor].data);
            }
            fetch(`https://twitter.com/i/api/1.1/dm/user_updates.json?${cursor ? `cursor=${cursor}&` : ''}cards_platform=Web-12&include_cards=1&include_ext_alt_text=true&include_quote_count=true&include_reply_count=1&tweet_mode=extended&include_ext_collab_control=true&dm_users=false&include_groups=true&include_inbox_timelines=true&include_ext_media_color=true&supports_reactions=true&nsfw_filtering_enabled=false&cursor=GRwmiICwidfJnf8qFozAuPGoksj_KiUkAAA&filter_low_quality=false&include_quality=all&include_ext_edit_control=false&ext=mediaColor%2CaltText%2CmediaStats%2ChighlightedLabel%2ChasNftAvatar%2CvoiceInfo%2Cenrichments%2CsuperFollowMetadata%2CunmentionInfo%2Ccollab_control`, {
                headers: {
                    "authorization": OLDTWITTER_CONFIG.oauth_key,
                    "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                    "x-twitter-auth-type": "OAuth2Session",
                    "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                },
                credentials: "include",
            }).then(i => i.json()).then(data => {
                if (data.errors && data.errors[0]) {
                    return reject(data.errors[0].message);
                }
                resolve(data);
                d.userUpdates[cursor] = {
                    date: Date.now(),
                    data: data
                };
                chrome.storage.local.set({userUpdates: d.userUpdates}, () => {});
            }).catch(e => {
                reject(e);
            });
        });
    });
}
API.deleteMessage = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://api.twitter.com/1.1/dm/destroy.json`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.oauth_key,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            credentials: "include",
            method: 'post',
            body: `dm_id=${id}`
        }).then(i => i.text()).then(data => {
            resolve(true);
        }).catch(e => {
            reject(e);
        });
    });
}
API.deleteConversation = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/1.1/dm/conversation/${id}/delete.json`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            credentials: "include",
            method: 'post',
        }).then(i => i.text()).then(data => {
            resolve(true);
        }).catch(e => {
            reject(e);
        });
    });
}

// Pins
API.unpinTweet = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/1.1/account/unpin_tweet.json`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            credentials: "include",
            method: 'post',
            body: `id=${id}`
        }).then(i => i.text()).then(data => {
            resolve(true);
        }).catch(e => {
            reject(e);
        });
    });
}
API.pinTweet = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/1.1/account/pin_tweet.json`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            credentials: "include",
            method: 'post',
            body: `id=${id}`
        }).then(i => i.text()).then(data => {
            resolve(true);
        }).catch(e => {
            reject(e);
        });
    });
}

// Bookmarks
API.getBookmarks = (cursor) => {
    return new Promise((resolve, reject) => {
        let obj = {"count":20,"includePromotedContent":true,"withSuperFollowsUserFields":true,"withDownvotePerspective":false,"withReactionsMetadata":false,"withReactionsPerspective":false,"withSuperFollowsTweetFields":true};
        if(cursor) obj.cursor = cursor;
        fetch(`https://twitter.com/i/api/graphql/-fOdcL5PyRcFM9_X5X-rfw/Bookmarks?variables=${encodeURIComponent(JSON.stringify(obj))}&features=${encodeURIComponent(JSON.stringify({"responsive_web_graphql_timeline_navigation_enabled":false,"unified_cards_ad_metadata_container_dynamic_card_content_query_enabled":false,"dont_mention_me_view_api_enabled":true,"responsive_web_uc_gql_enabled":true,"vibe_api_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":false,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":false,"interactive_text_enabled":true,"responsive_web_text_conversations_enabled":false,"responsive_web_enhance_cards_enabled":true}))}`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/json"
            },
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            let list = data.data.bookmark_timeline.timeline.instructions.find(i => i.type === 'TimelineAddEntries');
            if(!list) return resolve({ list: [], cursor: undefined });
            list = list.entries;
            resolve({
                list: list.filter(e => e.entryId.startsWith('tweet-')).map(e => {
                    let res = e.content.itemContent.tweet_results.result;
                    let tweet = res.legacy;
                    tweet.user = res.core.user_results.result.legacy;
                    tweet.user.id_str = tweet.user_id_str;
                    return tweet;
                }),
                cursor: list.find(e => e.entryId.startsWith('cursor-bottom-')).content.value
            });
        }).catch(e => {
            reject(e);
        });
    });
}
API.deleteAllBookmarks = () => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/skiACZKC1GDYli-M8RzEPQ/BookmarksAllDelete`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/json"
            },
            credentials: "include",
            method: 'post',
            body: `{"variables":{},"queryId":"skiACZKC1GDYli-M8RzEPQ"}`
        }).then(i => i.text()).then(() => {
            resolve(true);
        }).catch(e => {
            reject(e);
        });
    });
}
API.createBookmark = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/aoDbu3RHznuiSkQ9aNM67Q/CreateBookmark`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/json"
            },
            credentials: "include",
            method: 'post',
            body: JSON.stringify({"variables":{"tweet_id":id},"queryId":"aoDbu3RHznuiSkQ9aNM67Q"})
        }).then(i => i.text()).then(() => {
            resolve(true);
        }).catch(e => {
            reject(e);
        });
    });
}
API.deleteBookmark = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/Wlmlj2-xzyS1GN3a6cj-mQ/DeleteBookmark`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/json"
            },
            credentials: "include",
            method: 'post',
            body: JSON.stringify({"variables":{"tweet_id":id},"queryId":"Wlmlj2-xzyS1GN3a6cj-mQ"})
        }).then(i => i.text()).then(() => {
            resolve(true);
        }).catch(e => {
            reject(e);
        });
    });
}

// Lists
API.getListTweets = (id, cursor) => {
    return new Promise((resolve, reject) => {
        let obj = {"listId":id,"count":20,"withSuperFollowsUserFields":true,"withDownvotePerspective":false,"withReactionsMetadata":false,"withReactionsPerspective":false,"withSuperFollowsTweetFields":true};
        if(cursor) obj.cursor = cursor;
        fetch(`https://twitter.com/i/api/graphql/smHg9uz3WcyX_meRwh4g7A/ListLatestTweetsTimeline?variables=${encodeURIComponent(JSON.stringify(obj))}&features=${encodeURIComponent(JSON.stringify({"responsive_web_graphql_timeline_navigation_enabled":false,"unified_cards_ad_metadata_container_dynamic_card_content_query_enabled":false,"dont_mention_me_view_api_enabled":true,"responsive_web_uc_gql_enabled":true,"vibe_api_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":false,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":false,"interactive_text_enabled":true,"responsive_web_text_conversations_enabled":false,"responsive_web_enhance_cards_enabled":true}))}`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/json"
            },
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            let list = data.data.list.tweets_timeline.timeline.instructions.find(i => i.type === 'TimelineAddEntries');
            if(!list) return resolve({ list: [], cursor: undefined });
            list = list.entries;
            resolve({
                list: list.filter(e => e.entryId.startsWith('tweet-')).map(e => {
                    let res = e.content.itemContent.tweet_results.result;
                    if(!res) return;
                    let tweet = res.legacy;
                    if(!res.core) return;
                    tweet.user = res.core.user_results.result.legacy;
                    tweet.user.id_str = tweet.user_id_str;
                    return tweet;
                }).filter(i => !!i),
                cursor: list.find(e => e.entryId.startsWith('cursor-bottom-')).content.value
            });
        }).catch(e => {
            reject(e);
        });
    });
}
API.getListMembers = (id, cursor) => {
    return new Promise((resolve, reject) => {
        let obj = {"listId":id,"count":20,"withSuperFollowsUserFields":true,"withDownvotePerspective":false,"withReactionsMetadata":false,"withReactionsPerspective":false,"withSuperFollowsTweetFields":true,"withSafetyModeUserFields":true};
        if(cursor) obj.cursor = cursor;
        fetch(`https://twitter.com/i/api/graphql/sXFXEmtFr3nLyG1dmS81jw/ListMembers?variables=${encodeURIComponent(JSON.stringify(obj))}&features=${encodeURIComponent(JSON.stringify({"responsive_web_graphql_timeline_navigation_enabled":false,"unified_cards_ad_metadata_container_dynamic_card_content_query_enabled":false,"dont_mention_me_view_api_enabled":true,"responsive_web_uc_gql_enabled":true,"vibe_api_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":false,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":false,"interactive_text_enabled":true,"responsive_web_text_conversations_enabled":false,"responsive_web_enhance_cards_enabled":true}))}`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/json"
            },
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            let list = data.data.list.members_timeline.timeline.instructions.find(i => i.type === 'TimelineAddEntries');
            if(!list) return resolve({ list: [], cursor: undefined });
            list = list.entries;
            resolve({
                list: list.filter(e => e.entryId.startsWith('user-')).map(u => {
                    let res = u.content.itemContent.user_results.result;
                    res.legacy.id_str = res.rest_id;
                    return res.legacy;
                }),
                cursor: list.find(e => e.entryId.startsWith('cursor-bottom-')).content.value
            });
        }).catch(e => {
            reject(e);
        });
    });
}
API.getListFollowers = (id, cursor) => {
    return new Promise((resolve, reject) => {
        let obj = {"listId":id,"count":20,"withSuperFollowsUserFields":true,"withDownvotePerspective":false,"withReactionsMetadata":false,"withReactionsPerspective":false,"withSuperFollowsTweetFields":true,"withSafetyModeUserFields":true};
        if(cursor) obj.cursor = cursor;
        fetch(`https://twitter.com/i/api/graphql/LxXoouvfd5E8PXsdrQ0iMg/ListSubscribers?variables=${encodeURIComponent(JSON.stringify(obj))}&features=${encodeURIComponent(JSON.stringify({"responsive_web_graphql_timeline_navigation_enabled":false,"unified_cards_ad_metadata_container_dynamic_card_content_query_enabled":false,"dont_mention_me_view_api_enabled":true,"responsive_web_uc_gql_enabled":true,"vibe_api_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":false,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":false,"interactive_text_enabled":true,"responsive_web_text_conversations_enabled":false,"responsive_web_enhance_cards_enabled":true}))}`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/json"
            },
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            let list = data.data.list.subscribers_timeline.timeline.instructions.find(i => i.type === 'TimelineAddEntries');
            if(!list) return resolve({ list: [], cursor: undefined });
            list = list.entries;
            resolve({
                list: list.filter(e => e.entryId.startsWith('user-')).map(u => {
                    let res = u.content.itemContent.user_results.result;
                    res.legacy.id_str = res.rest_id;
                    return res.legacy;
                }),
                cursor: list.find(e => e.entryId.startsWith('cursor-bottom-')).content.value
            });
        }).catch(e => {
            reject(e);
        });
    });
}
API.getList = id => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['listData'], d => {
            if(!d.listData) d.listData = {};
            if(d.listData[id] && Date.now() - d.listData[id].date < 60000) {
                return resolve(d.listData[id].data);
            }
            fetch(`https://twitter.com/i/api/graphql/vxx-Y8zadpAP64HHiw4hMQ/ListByRestId?variables=${encodeURIComponent(JSON.stringify({"listId":id,"withSuperFollowsUserFields":true}))}&features=${encodeURIComponent(JSON.stringify({"responsive_web_graphql_timeline_navigation_enabled":false}))}`, {
                headers: {
                    "authorization": OLDTWITTER_CONFIG.public_token,
                    "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                    "x-twitter-auth-type": "OAuth2Session",
                    "content-type": "application/json"
                },
                credentials: "include"
            }).then(i => i.json()).then(data => {
                if (data.errors && data.errors[0].code === 32) {
                    return reject("Not logged in");
                }
                if (data.errors && data.errors[0]) {
                    return reject(data.errors[0].message);
                }
                resolve(data.data.list);
                d.listData[id] = {
                    date: Date.now(),
                    data: data.data.list
                };
                chrome.storage.local.set({listData: d.listData}, () => {});
            }).catch(e => {
                reject(e);
            });
        });
    });
}
API.subscribeList = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/nymTz5ek0FQPC3kh63Tp1w/ListSubscribe`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({"variables":{"listId":id,"withSuperFollowsUserFields":true},"features":{"responsive_web_graphql_timeline_navigation_enabled":false},"queryId":"nymTz5ek0FQPC3kh63Tp1w"}),
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            chrome.storage.local.set({listData: {}}, () => {});
            resolve(true);
        }).catch(e => {
            reject(e);
        });
    });
}
API.unsubscribeList = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/Wi5-aG4bvTmdjyRyRGkyhA/ListUnsubscribe`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({"variables":{"listId":id,"withSuperFollowsUserFields":true},"features":{"responsive_web_graphql_timeline_navigation_enabled":false},"queryId":"Wi5-aG4bvTmdjyRyRGkyhA"}),
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            chrome.storage.local.set({listData: {}}, () => {});
            resolve(true);
        }).catch(e => {
            reject(e);
        });
    });
}
API.updateList = (id, name, description, isPrivate) => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/P9YDuvCt6ogRf-kyr5E5xw/UpdateList`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({
                "variables": {
                    "listId": id,
                    "isPrivate": isPrivate,
                    "description": description,
                    "name": name,
                    "withSuperFollowsUserFields": true
                },
                "features": {
                    "responsive_web_graphql_timeline_navigation_enabled": false
                },
                "queryId": "P9YDuvCt6ogRf-kyr5E5xw"
            }),
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            chrome.storage.local.set({listData: {}}, () => {});
            resolve(true);
        }).catch(e => {
            reject(e);
        });
    });
}
API.deleteList = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/UnN9Th1BDbeLjpgjGSpL3Q/DeleteList`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({"variables":{"listId":id},"queryId":"UnN9Th1BDbeLjpgjGSpL3Q"}),
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            chrome.storage.local.set({listData: {}}, () => {});
            resolve(true);
        }).catch(e => {
            reject(e);
        });
    });
}
API.listAddMember = (listId, userId) => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/RKtQuzpcy2gym71UorWg6g/ListAddMember`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({"variables":{"listId":listId,"userId":userId,"withSuperFollowsUserFields":true},"features":{"responsive_web_graphql_timeline_navigation_enabled":false},"queryId":"RKtQuzpcy2gym71UorWg6g"}),
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            chrome.storage.local.set({listData: {}}, () => {});
            resolve(true);
        }).catch(e => {
            reject(e);
        });
    });
}
API.listRemoveMember = (listId, userId) => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/mDlp1UvnnALC_EzybKAMtA/ListRemoveMember`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({"variables":{"listId":listId,"userId":userId,"withSuperFollowsUserFields":true},"features":{"responsive_web_graphql_timeline_navigation_enabled":false},"queryId":"mDlp1UvnnALC_EzybKAMtA"}),
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            chrome.storage.local.set({listData: {}}, () => {});
            resolve(true);
        }).catch(e => {
            reject(e);
        });
    });
}
API.getMyLists = () => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/cl2dF-zeGiLvZDsMGZhL4g/ListsManagementPageTimeline?variables=${encodeURIComponent(JSON.stringify({"count":100,"withSuperFollowsUserFields":true,"withDownvotePerspective":false,"withReactionsMetadata":false,"withReactionsPerspective":false,"withSuperFollowsTweetFields":true}))}&features=${encodeURIComponent(JSON.stringify({"responsive_web_graphql_timeline_navigation_enabled":false,"unified_cards_ad_metadata_container_dynamic_card_content_query_enabled":false,"dont_mention_me_view_api_enabled":true,"responsive_web_uc_gql_enabled":true,"vibe_api_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":false,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":false,"interactive_text_enabled":true,"responsive_web_text_conversations_enabled":false,"responsive_web_enhance_cards_enabled":true}))}`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/json"
            },
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            chrome.storage.local.set({listData: {}}, () => {});
            resolve(
                data.data.viewer.list_management_timeline
                    .timeline.instructions.find(i => i.entries)
                    .entries.find(i => i.entryId === 'ownedSubscribedListModule')
                    .content.items.map(i => i.item.itemContent.list)
            );
        }).catch(e => {
            reject(e);
        });
    });
}
API.getUserLists = id => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/mLKOzzVOWUycBiExBT1gjg/CombinedLists?variables=${encodeURIComponent(JSON.stringify({"userId":id,"count":100,"withSuperFollowsUserFields":true,"withDownvotePerspective":false,"withReactionsMetadata":false,"withReactionsPerspective":false,"withSuperFollowsTweetFields":true}))}&features=${encodeURIComponent(JSON.stringify({"responsive_web_graphql_timeline_navigation_enabled":false,"unified_cards_ad_metadata_container_dynamic_card_content_query_enabled":false,"dont_mention_me_view_api_enabled":true,"responsive_web_uc_gql_enabled":true,"vibe_api_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":false,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":false,"interactive_text_enabled":true,"responsive_web_text_conversations_enabled":false,"responsive_web_enhance_cards_enabled":true}))}`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/json"
            },
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            chrome.storage.local.set({listData: {}}, () => {});
            resolve(
                data.data.user.result.timeline.timeline.instructions.find(i => i.entries).entries.filter(e => e.entryId.startsWith('list-')).map(e => e.content.itemContent.list)
            );
        }).catch(e => {
            reject(e);
        });
    });
}
API.createList = (name, description, isPrivate) => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/x5aSMDodNU02VT1VRyW48A/CreateList`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({"variables":{"isPrivate":isPrivate,"name":name,"description":description,"withSuperFollowsUserFields":true},"features":{"responsive_web_graphql_timeline_navigation_enabled":false},"queryId":"x5aSMDodNU02VT1VRyW48A"}),
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            chrome.storage.local.set({listData: {}}, () => {});
            resolve(data.data.list);
        }).catch(e => {
            reject(e);
        });
    });
}
API.getListOwnerships = (myId, userId) => {
    return new Promise((resolve, reject) => {
        fetch(`https://twitter.com/i/api/graphql/6E69fsenLDPDcprqtogzdw/ListOwnerships?variables=${encodeURIComponent(JSON.stringify({"userId":myId,"isListMemberTargetUserId":userId,"count":100,"withSuperFollowsUserFields":true,"withDownvotePerspective":false,"withReactionsMetadata":false,"withReactionsPerspective":false,"withSuperFollowsTweetFields":true}))}&features=${encodeURIComponent(JSON.stringify({"responsive_web_graphql_timeline_navigation_enabled":false,"unified_cards_ad_metadata_container_dynamic_card_content_query_enabled":false,"dont_mention_me_view_api_enabled":true,"responsive_web_uc_gql_enabled":true,"vibe_api_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":false,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":false,"interactive_text_enabled":true,"responsive_web_text_conversations_enabled":false,"responsive_web_enhance_cards_enabled":true}))}`, {
            headers: {
                "authorization": OLDTWITTER_CONFIG.public_token,
                "x-csrf-token": OLDTWITTER_CONFIG.csrf,
                "x-twitter-auth-type": "OAuth2Session",
                "content-type": "application/json"
            },
            credentials: "include"
        }).then(i => i.json()).then(data => {
            if (data.errors && data.errors[0].code === 32) {
                return reject("Not logged in");
            }
            if (data.errors && data.errors[0]) {
                return reject(data.errors[0].message);
            }
            chrome.storage.local.set({listData: {}}, () => {});
            resolve(
                data.data.user.result.timeline.timeline.instructions.find(i => i.entries).entries.filter(e => e.entryId.startsWith('list-')).map(e => e.content.itemContent.list)
            );
        }).catch(e => {
            reject(e);
        });
    });
}