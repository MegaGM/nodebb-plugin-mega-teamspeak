This plugin was developed on demand, exclusively for one particular website and was never meant to work with any others. Because of peculiar integration it provided to the website, like 2FA through Teamspeak and so.
It also utilizes Redis directly, without NodeBB driver, so there is no MongoDB compatibility.

The plugin has been working in production for many years and supports many features like realtime updating (with animations): channel info, channel tree changes, client info, client statuses, etc. It also automagically updates groups for particular Teamspeak clients when you add/remove their linked NodeBB user profiles to/from a NodeBB Group and much more.

If you're a developer and you want to develop a Teamspeak plugin yourself, you could start off by forking this repo. Or, at least, you certainly could use this repo as a reference, to see how you could implement various kinds of functionality you would need for your plugin.

![](https://camo.githubusercontent.com/b2f7d5f26abaeced4629a63289c78b045118124f50efc7ba7e578302e31ecfd0/68747470733a2f2f692e696d6775722e636f6d2f7133474c4f63692e6a7067)