/*
 * Copyright (C) 2015 Stefano D'Angelo <zanga.mail@gmail.com>
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

var audioWidgets = {

	// Generic widget
	widget: {
		// Read/write
		ctx:		null,
		x:		NaN,
		y:		NaN,
		width:		NaN,
		height:		NaN,

		// Read-only
		hoverCount:	0,
		activeCount:	0,
		disabled:	false,

		// Private
		listeners:	null,

		// Public

		init: function () {
			this.listeners = {};
		},

		hoverIn: function (hover) {
			if (hover) {
				this.hoverCount++;
				if (this.hoverCount == 1) {
					this.clear();
					this.draw();
				}
			} else {
				this.hoverCount--;
				if (this.hoverCount == 0) {
					this.clear();
					this.draw();
				}
			}
		},

		activeIn: function (activated) {
			if (activated) {
				this.activeCount++;
				if (this.activeCount == 1) {
					this.clear();
					this.draw();
					var e = new CustomEvent("active");
					this.dispatchEvent(e);
				}
			} else {
				this.activeCount--;
				if (this.activeCount == 0) {
					this.clear();
					this.draw();
					var e = new CustomEvent("inactive");
					this.dispatchEvent(e);
				}
			}
		},

		setDisabled: function (disabled) {
			if (this.disabled != disabled) {
				this.disabled = disabled;
				this.clear();
				this.draw();
				var e = new CustomEvent(disabled ? "disable"
								 : "enable");
				this.dispatchEvent(e);
			}
		},

		clear: function () {
			this.ctx.clearRect(this.x, this.y,
					   this.width, this.height);
		},

		draw: function () {
			this.ctx.save();

			this.ctx.lineWidth = 1;

			if (this.disabled)
				this.ctx.fillStyle = "#666";
			else if (this.activeCount != 0)
				this.ctx.fillStyle = "#888";
			else if (this.hoverCount != 0)
				this.ctx.fillStyle = "#ccc";
			else
				this.ctx.fillStyle = "#aaa";

			this.ctx.beginPath();
			this.ctx.rect(this.x, this.y, this.width, this.height);
			this.ctx.fill();

			this.ctx.restore();
		},

		addEventListener: function (type, listener, useCapture) {
			if (type in this.listeners) {
				var l = this.listeners[type];
				for (var i = 0; i < l.length; i++)
					if (l[i].listener == listener
					    && l[i].useCapture == useCapture)
						return;
			}

			var listener = { listener: listener,
					 useCapture: useCapture };
			if (!(type in this.listeners))
				this.listeners[type] = [listener];
			else
				this.listeners[type].push(listener);

			return listener;
		},

		removeEventListener: function (listener, useCapture) {
			for (var type in this.listeners) {
				var l = this.listeners[type];
				for (var i = 0; i < l.length; i++)
					if (l[i].listener == listener
					    && l[i].useCapture == useCapture) {
						l.slice(i, 1);
						return;
					}
			}
		},

		dispatchEvent: function (event) {
			if (!(event.type in this.listeners))
				return false;

			var l = this.listeners[event.type];
			for (var i = 0; i < l.length; i++)
				if (l[i].useCapture) {
					l[i].listener.call(this, event);
					if (event.defaultPrevented)
						return true;
				}

			for (var i = 0; i < l.length; i++)
				if (!l[i].useCapture) {
					l[i].listener.call(this, event);
					if (event.defaultPrevented)
						return true;
				}

			return false;
		}
	}

};
