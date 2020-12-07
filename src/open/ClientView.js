/*
Copyright 2020 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import {TemplateView} from "../utils/TemplateView.js";
import {copy} from "../utils/copy.js";
import {text} from "../utils/html.js";

function formatPlatforms(platforms) {
	return platforms.reduce((str, p, i, all) => {
		const first = i === 0;
		const last = i === all.length - 1;
		return str + (first ? "" : last ? " & " : ", ") + p;
	}, "");
}

export class ClientView extends TemplateView {

	render(t, vm) {
		return t.div({className: "ClientView"}, [
			t.div({className: "header"}, [
				t.div({className: "description"}, [
					t.h3(vm.name),
					t.p(vm.description),
					t.p({className: "platforms"}, formatPlatforms(vm.availableOnPlatformNames)),
				]),
				t.img({className: "clientIcon", src: vm.iconUrl})
			]),
			t.mapView(vm => vm.stage, stage => {
				switch (stage) {
					case "open": return new OpenClientView(vm);
					case "install": return new InstallClientView(vm);
				}
			}),
		]);
	}
}

class OpenClientView extends TemplateView {
	render(t, vm) {
		return t.div({className: "OpenClientView"}, [
			t.a({
				className: "primary fullwidth",
				href: vm.deepLink,
				rel: "noopener noreferrer",
				onClick: () => vm.deepLinkActivated(),
			}, "Continue"),
            showBack(t, vm),
		]);
	}
}

class InstallClientView extends TemplateView {
	render(t, vm) {
		const children = [];

		if (vm.textInstructions) {
            const copyButton = t.button({
                className: "copy",
                onClick: evt => {
                    if (copy(vm.copyString, copyButton.parentElement)) {
                        copyButton.className = "tick";
                        setTimeout(() => {
                            copyButton.className = "copy";
                        }, 2000);
                    }
                }
            });
			children.push(t.p({className: "instructions"}, [t.code(vm.textInstructions), copyButton]));
		}

		const actions = t.div({className: "actions"}, vm.actions.map(a => {
			let badgeUrl;
			switch (a.kind) {
				case "play-store": badgeUrl = "images/google-play-us.svg"; break;
				case "fdroid": badgeUrl = "images/fdroid-badge.png"; break;
				case "apple-app-store": badgeUrl = "images/app-store-us-alt.svg"; break;
                case "flathub": badgeUrl = "images/flathub-badge.svg"; break;
			}
			return t.a({
				href: a.url,
				className: {
					fullwidth: !badgeUrl,
					primary: a.primary && !badgeUrl,
					secondary: !a.primary && !badgeUrl,
					badge: !!badgeUrl,
				},
				rel: "noopener noreferrer",
				["aria-label"]: a.label, 
				onClick: () => a.activated()
			}, badgeUrl ? t.img({src: badgeUrl}) : a.label);
		}));
		children.push(actions);

		if (vm.showDeepLinkInInstall) {
			const deepLink = t.a({
				rel: "noopener noreferrer",
				href: vm.deepLink,
				onClick: () => vm.deepLinkActivated(),
			}, "open it here");
			children.push(t.p([`If you already have ${vm.name} installed, you can `, deepLink, "."]))
		}

        children.push(showBack(t, vm));

		return t.div({className: "InstallClientView"}, children);
	}
}

function showBack(t, vm) {
    return t.p({className: {previewSource: true, hidden: vm => !vm.showBack}}, [
        `Continue with ${vm.name}.`,
        " ",
        t.button({className: "text", onClick: () => vm.back()}, "Change"),
    ]);
}
